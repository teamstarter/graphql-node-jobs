const request = require('supertest')
const addMinutes = require('date-fns/addMinutes')

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
describe('Test the onRetry mutation', () => {
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
  it('The job can be restarted if it fails or it is cancelled', async () => {
    let responseRetryJob = await request(server)
      .post('/graphql')
      .send(
        retryJob({
          id: 3,
        })
      )

    expect(responseRetryJob.body.errors).toBeUndefined()
    expect(responseRetryJob.body.data).toMatchSnapshot()

    responseRetryJob = await request(server)
      .post('/graphql')
      .send(
        retryJob({
          id: 5,
        })
      )

    expect(responseRetryJob.body.errors).toBeUndefined()
    expect(responseRetryJob.body.data).toMatchSnapshot()
  })

  it('You cannot retry a job if this one is not failed', async () => {
    const responseRetryJob = await request(server)
      .post('/graphql')
      .send(
        retryJob({
          id: 1,
        })
      )

    expect(responseRetryJob.body.errors).toHaveLength(1)
    expect(responseRetryJob.body.errors[0].message).toBe(
      'The job must be failed or cancelled.'
    )
  })

  it('You cannot retry a job that does not exist', async () => {
    const responseRetryJob = await request(server)
      .post('/graphql')
      .send(
        retryJob({
          id: 100,
        })
      )

    expect(responseRetryJob.body.errors).toHaveLength(1)
    expect(responseRetryJob.body.errors[0].message).toBe(
      'The job does not exist.'
    )
  })
})
