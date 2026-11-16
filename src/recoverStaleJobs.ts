import { QueryTypes, Sequelize } from 'sequelize'
import { getModelsAndInitializeDatabase } from './models'
import { JobType } from './types'

export type StaleJobAction = 'requeue' | 'cancel'

export type RecoverStaleJobsResult = {
  requeued: JobType[]
  cancelled: JobType[]
}

export const STALE_JOB_CANCEL_MESSAGE =
  'Interrupted: the worker of the job stopped sending heartbeats.'

// The statuses in which a worker is still running the job.
const RUNNING_STATUSES = `('processing', 'cancel-requested')`

function getStaleCondition(checkJobsWithoutHeartbeat: boolean) {
  const withoutHeartbeat = checkJobsWithoutHeartbeat
    ? `OR ("heartbeatAt" IS NULL AND COALESCE("startedAt", "createdAt") < :startedLimit)`
    : ''

  return `"status" IN ${RUNNING_STATUSES}
    AND "deletedAt" IS NULL
    AND (
      ("heartbeatAt" IS NOT NULL AND "heartbeatAt" < :heartbeatLimit)
      ${withoutHeartbeat}
    )`
}

async function updateStaleJobs(
  sequelize: Sequelize,
  set: string,
  ids: number[],
  staleCondition: string,
  replacements: Record<string, unknown>,
): Promise<JobType[]> {
  if (ids.length === 0) {
    return []
  }

  // The stale condition is checked again: a heartbeat received since the
  // selection, or another process recovering the same job, wins.
  const [rows] = await sequelize.query(
    `UPDATE job SET ${set}
    WHERE id IN (:ids) AND ${staleCondition}
    RETURNING *`,
    { replacements: { ...replacements, ids } },
  )

  return rows as JobType[]
}

/**
 * Requeues or cancels the jobs still running whose worker no longer gives
 * signs of life (a thread or a process that died, an instance replaced).
 *
 * A job is stale when its last heartbeat (job.heartbeatAt, sent by
 * checkForJobs with a heartbeatInterval) is older than `staleAfter` ms. With
 * `withoutHeartbeatStaleAfter`, a job that never sent a heartbeat (worker
 * without heartbeatInterval, or of an older version) is stale when it started
 * more than `withoutHeartbeatStaleAfter` ms ago.
 *
 * `getAction(job)` decides for each `processing` job:
 * - 'requeue': the same job goes back to `queued`, to be run again from the
 *   start (processingInfo emptied). It keeps its id, so what links to it keeps
 *   working. Only for a job that can run twice without harm;
 * - 'cancel' (default): the job ends `cancelled`, with STALE_JOB_CANCEL_MESSAGE
 *   in output.cancelMessage.
 * A stale `cancel-requested` job is always cancelled.
 *
 * onJobFail is not called: the job was interrupted, it did not fail. The
 * caller gets the recovered jobs and reports them as it wants.
 *
 * Several processes may run it at the same time: each job is recovered by one
 * of them only.
 */
export default async function recoverStaleJobs({
  dbConfig,
  sequelizeInstance,
  staleAfter,
  withoutHeartbeatStaleAfter,
  getAction = () => 'cancel',
}: {
  dbConfig?: any
  sequelizeInstance?: Sequelize
  staleAfter: number
  withoutHeartbeatStaleAfter?: number
  getAction?: (job: JobType) => StaleJobAction | Promise<StaleJobAction>
}): Promise<RecoverStaleJobsResult> {
  if (!(staleAfter > 0)) {
    throw new Error('Please provide a staleAfter duration in milliseconds.')
  }

  const models = await getModelsAndInitializeDatabase({
    dbConfig,
    sequelizeInstance,
  })
  const sequelize: Sequelize = models.sequelize

  const now = new Date()
  const checkJobsWithoutHeartbeat = withoutHeartbeatStaleAfter !== undefined
  const staleCondition = getStaleCondition(checkJobsWithoutHeartbeat)
  const replacements: Record<string, unknown> = {
    now,
    heartbeatLimit: new Date(now.getTime() - staleAfter),
    ...(checkJobsWithoutHeartbeat
      ? {
          startedLimit: new Date(
            now.getTime() - (withoutHeartbeatStaleAfter as number),
          ),
        }
      : {}),
  }

  const staleJobs = await sequelize.query<JobType>(
    `SELECT * FROM job WHERE ${staleCondition} ORDER BY id`,
    { replacements, type: QueryTypes.SELECT },
  )

  const idsToRequeue: number[] = []
  const idsToCancel: number[] = []
  for (const job of staleJobs) {
    const action = job.status === 'processing' ? await getAction(job) : 'cancel'
    ;(action === 'requeue' ? idsToRequeue : idsToCancel).push(job.id as number)
  }

  const requeued = await updateStaleJobs(
    sequelize,
    `"status" = 'queued',
      "workerId" = NULL,
      "startedAt" = NULL,
      "heartbeatAt" = NULL,
      "processingInfo" = NULL,
      "updatedAt" = :now`,
    idsToRequeue,
    `"status" = 'processing' AND ${staleCondition}`,
    replacements,
  )

  const cancelled = await updateStaleJobs(
    sequelize,
    `"status" = 'cancelled',
      "output" = CAST(:output AS JSON),
      "cancelledAt" = :now,
      "endedAt" = :now,
      "updatedAt" = :now`,
    idsToCancel,
    staleCondition,
    {
      ...replacements,
      output: JSON.stringify({ cancelMessage: STALE_JOB_CANCEL_MESSAGE }),
    },
  )

  return { requeued, cancelled }
}
