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
const {
  PRIORITY_LOW,
  PRIORITY_MED,
  PRIORITY_HIGH,
} = require('./../lib/index')

jest.setTimeout(600000)

let server = null

const acquireJob = (variables) => ({
  query: `mutation($typeList: [String!]!, $workerId: String) {
    acquireJob(
      typeList: $typeList
      workerId: $workerId
    ) {
      id
      name
      status
    }
  }`,
  variables,
  operationName: null,
})

describe('Test job priorityLevel ordering', () => {
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

  it('Exposes the three priority constants with the documented values.', () => {
    expect(PRIORITY_LOW).toBe(1)
    expect(PRIORITY_MED).toBe(4)
    expect(PRIORITY_HIGH).toBe(8)
  })

  it('A job created without specifying priorityLevel defaults to PRIORITY_MED.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const job = await models.job.create({
      type: 'priority-default',
      status: 'queued',
    })
    expect(job.priorityLevel).toBe(PRIORITY_MED)
  })

  it('Higher priority jobs are acquired before lower priority jobs even if they were queued later.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'priority-test'

    const lowJob = await models.job.create({
      type,
      status: 'queued',
      priorityLevel: PRIORITY_LOW,
    })
    const medJob = await models.job.create({
      type,
      status: 'queued',
      priorityLevel: PRIORITY_MED,
    })
    const highJob = await models.job.create({
      type,
      status: 'queued',
      priorityLevel: PRIORITY_HIGH,
    })

    const first = await request(server)
      .post('/graphql')
      .send(acquireJob({ typeList: [type] }))
    expect(first.body.errors).toBeUndefined()
    expect(first.body.data.acquireJob.id).toBe(highJob.id)

    const second = await request(server)
      .post('/graphql')
      .send(acquireJob({ typeList: [type] }))
    expect(second.body.errors).toBeUndefined()
    expect(second.body.data.acquireJob.id).toBe(medJob.id)

    const third = await request(server)
      .post('/graphql')
      .send(acquireJob({ typeList: [type] }))
    expect(third.body.errors).toBeUndefined()
    expect(third.body.data.acquireJob.id).toBe(lowJob.id)
  })

  it('Within the same priority, jobs are acquired in id (insertion) order.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'priority-tiebreak'

    const firstQueued = await models.job.create({
      type,
      status: 'queued',
      priorityLevel: PRIORITY_MED,
    })
    const secondQueued = await models.job.create({
      type,
      status: 'queued',
      priorityLevel: PRIORITY_MED,
    })

    const first = await request(server)
      .post('/graphql')
      .send(acquireJob({ typeList: [type] }))
    expect(first.body.data.acquireJob.id).toBe(firstQueued.id)

    const second = await request(server)
      .post('/graphql')
      .send(acquireJob({ typeList: [type] }))
    expect(second.body.data.acquireJob.id).toBe(secondQueued.id)
  })
})
