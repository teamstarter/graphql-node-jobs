const request = require('supertest')
const addMinutes = require('date-fns/addMinutes')

const {
  migrateDatabase,
  seedDatabase,
  getNewServer,
  getModels,
  closeEverything,
  deleteTables,
  resetDatabase,
} = require('./test-database.js')
const {
  checkForJobs,
  listJobs,
  getNewClient,
  createJob,
  CancelRequestedError,
} = require('../lib/index')

// This is the maximum amount of time the band of test can run before timing-out
jest.setTimeout(600000)

let server = null
const client = getNewClient(
  `http://localhost:${process.env.PORT || 8080}/graphql`
)

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time))

const acquireJob = (variables) => ({
  query: `mutation($typeList: [String!]!, $workerId: String) {
    acquireJob(
      typeList: $typeList
      workerId: $workerId
    ) {
      id
      name
      status
      output
    }
  }`,
  variables,
  operationName: null,
})

const jobCreate = (variables) => ({
  query: `mutation($job: jobInput!) {
    jobCreate(
      job: $job
    ) {
      id
      name
      status
      output
      jobUniqueId
    }
  }`,
  variables,
  operationName: null,
})

const jobUpdate = (variables) => ({
  query: `mutation($job: jobInput!) {
    jobUpdate(
      job: $job
    ) {
      id
      name
      status
      isUpdateAlreadyCalledWhileCancelRequested
    }
  }`,
  variables,
  operationName: null,
})

const jobList = (variables) => ({
  query: `query($where: SequelizeJSON!) {
    job(
      where: $where
    ) {
      id
      name
      status
      isHighFrequency
    }
  }`,
  variables,
  operationName: null,
})

const customAcquire = (variables) => ({
  query: `mutation($typeList: [String!]!) {
    customAcquire(
      typeList: $typeList
    ) {
      id
    }
  }`,
  variables,
  operationName: null,
})

const recoverJob = (variables) => ({
  query: `mutation($id: Int!) {
    recover(id: $id) {
      id
      status
    }
  }`,
  variables,
  operationName: null,
})

const toggleHoldJobType = (variables) => ({
  query: `mutation($type: String!) {
    toggleHoldJobType(type: $type) {
      id
      type

    }
  }`,
  variables,
  operationName: null,
})

const retryJob = (variables) => ({
  query: `mutation retryJob($id: Int!){
    retryJob(id: $id) {
      id
      name
      type
      status
    }
  }`,
  variables,
  operationName: null,
})

/**
 * Starting the tests
 */
describe('Test the batch endpoint', () => {
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
    const models = await getModels()
    await closeEverything(server, models, done)
  })

  it('If job fail the associated batch fail', async () => {
    const models = await getModels()
    const batch = await models.batch.create({
      status: 'planned',
      pipelineId: 1,
    })

    const job1 = await createJob(client, {
      type: 'd',
      status: 'queued',
      batchId: batch.id,
    })
    const job2 = await createJob(client, {
      type: 'd',
      status: 'queued',
      name: 'test',
      batchId: batch.id,
    })
    const job3 = await createJob(client, {
      type: 'd',
      status: 'queued',
      batchId: batch.id,
    })

    const jobChecked1 = await checkForJobs({
      typeList: ['d'],
      client,
      processingFunction: (job) => {
        return { total: 125 }
      },
      looping: false,
    })

    expect(jobChecked1.status).toBe('successful')

    const jobChecked2 = await checkForJobs({
      typeList: ['d'],
      client,
      processingFunction: (job) => {
        const a = {}
        a.awd()

        return { total: 125 }
      },
      looping: false,
    })
    expect(jobChecked2.status).toBe('failed')

    const jobChecked3 = await checkForJobs({
      typeList: ['d'],
      client,
      processingFunction: (job) => {
        return { total: 125 }
      },
      looping: false,
    })

    expect(jobChecked3.status).toBe('successful')

    await wait(500)

    const batchUpdated = await models.batch.findOne({
      where: { id: batch.id },
    })

    expect(batchUpdated.status).toBe('failed')
  })

  it('Batch can be successful if all jobs associated are successful', async () => {
    const models = await getModels()
    const batch = await models.batch.create({
      status: 'planned',
      pipelineId: 2,
    })

    const job1 = await createJob(client, {
      type: 'd',
      status: 'queued',
      batchId: batch.id,
    })

    const job2 = await createJob(client, {
      type: 'd',
      status: 'queued',
      batchId: batch.id,
    })

    const jobChecked1 = await checkForJobs({
      typeList: ['d'],
      client,
      processingFunction: (job) => {
        return { total: 125 }
      },
      looping: false,
    })
    expect(jobChecked1.status).toBe('successful')

    const jobChecked2 = await checkForJobs({
      typeList: ['d'],
      client,
      processingFunction: (job) => {
        return { total: 125 }
      },
      looping: false,
    })
    expect(jobChecked2.status).toBe('successful')

    await wait(500)

    const batchUpdated = await models.batch.findOne({
      where: { id: batch.id },
    })
    expect(batchUpdated.status).toBe('successful')
  })
})
