const request = require('supertest')

const {
  migrateDatabase,
  seedDatabase,
  getNewServer,
  getModelsAndInitializeDatabase,
  closeEverything,
  deleteTables,
  resetDatabase,
} = require('./test-database.js')
const { checkForJobs, getNewClient, createJob } = require('../lib/index')

jest.setTimeout(600000)

let server = null
const client = getNewClient(
  `http://localhost:${process.env.PORT || 8080}/graphql`,
)

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time))

const heartbeatJob = (variables) => ({
  query: `mutation($id: Int!, $workerId: String) {
    heartbeatJob(id: $id, workerId: $workerId) {
      id
      status
    }
  }`,
  variables,
  operationName: null,
})

const getHeartbeatAt = async (models, id) => {
  const job = await models.job.findByPk(id)
  return job.heartbeatAt
}

describe('Job heartbeats', () => {
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

  it('checkForJobs with a heartbeatInterval updates heartbeatAt while the job runs, and stops when it ends', async () => {
    const models = await getModelsAndInitializeDatabase()
    const { id } = await createJob(client, { type: 'heartbeat-test' })

    const heartbeatsDuringTheRun = []
    const job = await checkForJobs({
      typeList: ['heartbeat-test'],
      client,
      workerId: 'worker-1',
      heartbeatInterval: 100,
      looping: false,
      processingFunction: async () => {
        await wait(50)
        heartbeatsDuringTheRun.push(await getHeartbeatAt(models, id))
        await wait(250)
        heartbeatsDuringTheRun.push(await getHeartbeatAt(models, id))
        return { done: true }
      },
    })

    expect(job.status).toBe('successful')
    const [first, last] = heartbeatsDuringTheRun
    // The first heartbeat is sent as soon as the job is acquired.
    expect(first).not.toBe(null)
    expect(last.getTime()).toBeGreaterThan(first.getTime())

    const heartbeatAtTheEnd = await getHeartbeatAt(models, id)
    await wait(300)
    expect((await getHeartbeatAt(models, id)).getTime()).toBe(
      heartbeatAtTheEnd.getTime(),
    )
  })

  it('checkForJobs without heartbeatInterval sends no heartbeat', async () => {
    const models = await getModelsAndInitializeDatabase()
    const { id } = await createJob(client, { type: 'heartbeat-test' })

    await checkForJobs({
      typeList: ['heartbeat-test'],
      client,
      looping: false,
      processingFunction: async () => {
        await wait(200)
        return {}
      },
    })

    expect(await getHeartbeatAt(models, id)).toBe(null)
  })

  it('heartbeatJob only accepts a running job, from the worker running it', async () => {
    const models = await getModelsAndInitializeDatabase()
    const queued = await createJob(client, { type: 'heartbeat-test' })
    const running = await models.job.create({
      type: 'heartbeat-test',
      status: 'processing',
      workerId: 'worker-1',
    })

    const onQueued = await request(server)
      .post('/graphql')
      .send(heartbeatJob({ id: queued.id }))
    expect(onQueued.body.errors).toBeUndefined()
    expect(onQueued.body.data.heartbeatJob).toBe(null)

    const fromAnotherWorker = await request(server)
      .post('/graphql')
      .send(heartbeatJob({ id: running.id, workerId: 'worker-2' }))
    expect(fromAnotherWorker.body.data.heartbeatJob).toBe(null)
    expect(await getHeartbeatAt(models, running.id)).toBe(null)

    const fromItsWorker = await request(server)
      .post('/graphql')
      .send(heartbeatJob({ id: running.id, workerId: 'worker-1' }))
    expect(fromItsWorker.body.errors).toBeUndefined()
    expect(fromItsWorker.body.data.heartbeatJob).toEqual({
      id: running.id,
      status: 'processing',
    })

    const updated = await models.job.findByPk(running.id)
    expect(updated.heartbeatAt).not.toBe(null)
    // A heartbeat is not a change of the job.
    expect(updated.updatedAt.getTime()).toBe(running.updatedAt.getTime())
  })

  it('acquireJob clears the heartbeat of a previous run', async () => {
    const models = await getModelsAndInitializeDatabase()
    const job = await models.job.create({
      type: 'heartbeat-test',
      status: 'queued',
      heartbeatAt: new Date('2026-01-01T00:00:00Z'),
    })

    let heartbeatAtTheStart
    await checkForJobs({
      typeList: ['heartbeat-test'],
      client,
      looping: false,
      processingFunction: async () => {
        heartbeatAtTheStart = await getHeartbeatAt(models, job.id)
        return {}
      },
    })

    expect(heartbeatAtTheStart).toBe(null)
  })
})
