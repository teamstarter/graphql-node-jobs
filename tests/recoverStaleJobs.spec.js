const {
  migrateDatabase,
  seedDatabase,
  getNewServer,
  getModelsAndInitializeDatabase,
  closeEverything,
  deleteTables,
  resetDatabase,
} = require('./test-database.js')
const { recoverStaleJobs, STALE_JOB_CANCEL_MESSAGE } = require('../lib/index')

const dbConfig = require('../config/sequelizeConfig.js').test

jest.setTimeout(600000)

let server = null

const MINUTE = 60 * 1000
const minutesAgo = (minutes) => new Date(Date.now() - minutes * MINUTE)

// The jobs of a worker restart: some workers died with it, others still run.
const createJobs = async (models) => {
  const create = (attributes) =>
    models.job.create({
      status: 'processing',
      workerId: 'a-worker',
      processingInfo: { steps: { first: { status: 'done' } } },
      ...attributes,
    })

  return {
    deadRerunnable: await create({
      type: 'rerunnable',
      startedAt: minutesAgo(30),
      heartbeatAt: minutesAgo(20),
    }),
    deadNotRerunnable: await create({
      type: 'send-emails',
      startedAt: minutesAgo(30),
      heartbeatAt: minutesAgo(20),
    }),
    alive: await create({
      type: 'rerunnable',
      startedAt: minutesAgo(90),
      heartbeatAt: minutesAgo(1),
    }),
    oldWithoutHeartbeat: await create({
      type: 'rerunnable',
      startedAt: minutesAgo(120),
    }),
    recentWithoutHeartbeat: await create({
      type: 'rerunnable',
      startedAt: minutesAgo(5),
    }),
    deadCancelRequested: await create({
      type: 'rerunnable',
      status: 'cancel-requested',
      startedAt: minutesAgo(30),
      heartbeatAt: minutesAgo(20),
    }),
    queuedWithAnOldHeartbeat: await create({
      type: 'rerunnable',
      status: 'queued',
      workerId: null,
      heartbeatAt: minutesAgo(20),
    }),
  }
}

const getAction = (job) => (job.type === 'rerunnable' ? 'requeue' : 'cancel')

const describeJob = (job) =>
  job && {
    type: job.type,
    status: job.status,
    workerId: job.workerId,
    output: job.output,
    processingInfo: job.processingInfo,
    hasStartedAt: Boolean(job.startedAt),
    hasHeartbeatAt: Boolean(job.heartbeatAt),
    hasCancelledAt: Boolean(job.cancelledAt),
    hasEndedAt: Boolean(job.endedAt),
  }

const describeAll = async (models, jobs) => {
  const described = {}
  for (const [name, job] of Object.entries(jobs)) {
    described[name] = describeJob(await models.job.findByPk(job.id))
  }
  return described
}

describe('recoverStaleJobs', () => {
  beforeAll(async () => {
    await migrateDatabase()
    await seedDatabase()
    server = await getNewServer()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  afterEach(async () => {
    await deleteTables()
  })

  afterAll(async (done) => {
    const models = await getModelsAndInitializeDatabase()
    await closeEverything(server, models, done)
  })

  it('requeues or cancels the jobs whose heartbeat stopped, and leaves the others', async () => {
    const models = await getModelsAndInitializeDatabase()
    const jobs = await createJobs(models)

    const result = await recoverStaleJobs({
      dbConfig,
      staleAfter: 10 * MINUTE,
      getAction,
    })

    const ids = (recovered) =>
      recovered.map((job) => job.id).sort((a, b) => a - b)
    expect(ids(result.requeued)).toEqual([jobs.deadRerunnable.id])
    expect(ids(result.cancelled)).toEqual([
      jobs.deadNotRerunnable.id,
      jobs.deadCancelRequested.id,
    ])

    const after = await describeAll(models, jobs)
    expect(after.deadRerunnable).toEqual({
      type: 'rerunnable',
      status: 'queued',
      workerId: null,
      output: null,
      processingInfo: null,
      hasStartedAt: false,
      hasHeartbeatAt: false,
      hasCancelledAt: false,
      hasEndedAt: false,
    })
    expect(after.deadNotRerunnable.status).toBe('cancelled')
    expect(after.deadNotRerunnable.output).toEqual({
      cancelMessage: STALE_JOB_CANCEL_MESSAGE,
    })
    expect(after.deadNotRerunnable.hasCancelledAt).toBe(true)
    expect(after.deadNotRerunnable.hasEndedAt).toBe(true)
    // Its steps stay, to see where it stopped.
    expect(after.deadNotRerunnable.processingInfo).toEqual({
      steps: { first: { status: 'done' } },
    })
    // A job whose cancellation was requested is not run again.
    expect(after.deadCancelRequested.status).toBe('cancelled')

    expect(after.alive.status).toBe('processing')
    expect(after.oldWithoutHeartbeat.status).toBe('processing')
    expect(after.recentWithoutHeartbeat.status).toBe('processing')
    expect(after.queuedWithAnOldHeartbeat.status).toBe('queued')
  })

  it('with withoutHeartbeatStaleAfter, also recovers the old jobs that never sent a heartbeat', async () => {
    const models = await getModelsAndInitializeDatabase()
    const jobs = await createJobs(models)

    const result = await recoverStaleJobs({
      dbConfig,
      staleAfter: 10 * MINUTE,
      withoutHeartbeatStaleAfter: 60 * MINUTE,
      getAction,
    })

    expect(result.requeued.map((job) => job.id).sort((a, b) => a - b)).toEqual([
      jobs.deadRerunnable.id,
      jobs.oldWithoutHeartbeat.id,
    ])
    const after = await describeAll(models, jobs)
    expect(after.oldWithoutHeartbeat.status).toBe('queued')
    expect(after.recentWithoutHeartbeat.status).toBe('processing')
    expect(after.alive.status).toBe('processing')
  })

  it('cancels by default, and recovers each job once', async () => {
    const models = await getModelsAndInitializeDatabase()
    const jobs = await createJobs(models)

    const [first, second] = await Promise.all([
      recoverStaleJobs({ dbConfig, staleAfter: 10 * MINUTE }),
      recoverStaleJobs({ dbConfig, staleAfter: 10 * MINUTE }),
    ])

    const recoveredIds = [...first.cancelled, ...second.cancelled]
      .map((job) => job.id)
      .sort((a, b) => a - b)
    expect(recoveredIds).toEqual([
      jobs.deadRerunnable.id,
      jobs.deadNotRerunnable.id,
      jobs.deadCancelRequested.id,
    ])
    expect([...first.requeued, ...second.requeued]).toEqual([])

    const again = await recoverStaleJobs({ dbConfig, staleAfter: 10 * MINUTE })
    expect(again).toEqual({ requeued: [], cancelled: [] })
  })

  it('refuses to run without a staleAfter duration', async () => {
    await expect(recoverStaleJobs({ dbConfig })).rejects.toThrow(
      'Please provide a staleAfter duration in milliseconds.',
    )
  })
})
