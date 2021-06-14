const request = require('supertest')
const addMinutes = require('date-fns/addMinutes')

const {
  migrateDatabase,
  seedDatabase,
  getNewServer,
  models,
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
describe('Test the job endpoint', () => {
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
    await closeEverything(server, models, done)
  })

  it('Be able to hold a type of job and toggle it', async () => {
    const responseToggleHoldJob = await request(server)
      .post('/graphql')
      .send(
        toggleHoldJobType({
          type: 'type-1',
        })
      )
    expect(responseToggleHoldJob.body.errors).toBeUndefined()
    expect(responseToggleHoldJob.body.data).toMatchSnapshot()

    const job1 = await createJob(client, {
      type: 'type-1',
      status: 'queued',
    })
    const job2 = await createJob(client, {
      type: 'type-2',
      status: 'queued',
    })
    const job3 = await createJob(client, {
      type: 'type-2',
      status: 'queued',
    })

    const responseCheck1 = await checkForJobs({
      typeList: ['type-1', 'type-2'],
      client,
      processingFunction: async (job) => {
        return { data: 'my data' }
      },
      looping: false,
    })
    expect(responseCheck1).not.toBeUndefined()
    expect(responseCheck1).not.toBe(null)
    expect(responseCheck1.type).toBe('type-2')

    const responseCheck2 = await checkForJobs({
      typeList: ['type-1', 'type-2'],
      client,
      processingFunction: async (job) => {
        return { data: 'my data' }
      },
      looping: false,
    })
    expect(responseCheck2).not.toBeUndefined()
    expect(responseCheck2).not.toBe(null)
    expect(responseCheck2.type).toBe('type-2')

    const responseCheck3 = await checkForJobs({
      typeList: ['type-1', 'type-2'],
      client,
      processingFunction: async (job) => {
        return { data: 'my data' }
      },
      looping: false,
    })
    expect(responseCheck3).not.toBeUndefined()
    expect(responseCheck3).toBe(null)

    const responseToggleHoldJob2 = await request(server)
      .post('/graphql')
      .send(
        toggleHoldJobType({
          type: 'type-1',
        })
      )

    expect(responseToggleHoldJob2.body.errors).toBeUndefined()
    expect(responseToggleHoldJob2.body.data.toggleHoldJobType).toBe(null)

    const responseCheck4 = await checkForJobs({
      typeList: ['type-1', 'type-2'],
      client,
      processingFunction: async (job) => {
        return { data: 'my data' }
      },
      looping: false,
    })

    expect(responseCheck4).not.toBeUndefined()
    expect(responseCheck4).not.toBe(null)
    expect(responseCheck4.type).toBe('type-1')
  })
})
