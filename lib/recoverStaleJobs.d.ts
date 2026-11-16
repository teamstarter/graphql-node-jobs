import { Sequelize } from 'sequelize';
import { JobType } from './types';
export type StaleJobAction = 'requeue' | 'cancel';
export type RecoverStaleJobsResult = {
    requeued: JobType[];
    cancelled: JobType[];
};
export declare const STALE_JOB_CANCEL_MESSAGE = "Interrupted: the worker of the job stopped sending heartbeats.";
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
export default function recoverStaleJobs({ dbConfig, sequelizeInstance, staleAfter, withoutHeartbeatStaleAfter, getAction, }: {
    dbConfig?: any;
    sequelizeInstance?: Sequelize;
    staleAfter: number;
    withoutHeartbeatStaleAfter?: number;
    getAction?: (job: JobType) => StaleJobAction | Promise<StaleJobAction>;
}): Promise<RecoverStaleJobsResult>;
