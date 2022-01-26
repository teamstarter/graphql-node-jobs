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
describe('Test acquireJob mutation', () => {
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

  it('Acquiring a job require a type', async () => {
    console.log('Before')
    const response = await request(server).post('/graphql').send(acquireJob({}))
    console.log('After')

    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].message).toMatchSnapshot()
  })

  // it('One can acquire a job of a given type.', async () => {
  //   const response = await request(server)
  //     .post('/graphql')
  //     .send(
  //       acquireJob({
  //         typeList: ['a'],
  //       })
  //     )

  //   expect(response.body.errors).toBeUndefined()
  //   expect(response.body.data).toMatchSnapshot()

  //   const response2 = await request(server)
  //     .post('/graphql')
  //     .send(
  //       acquireJob({
  //         typeList: ['a'],
  //       })
  //     )

  //   expect(response2.body.errors).toBeUndefined()
  //   expect(response2.body.data.acquireJob).toBe(null)
  // })

  // it('When a job is planified to be run in the future, it cannot be acquired.', async () => {
  //   const date = new Date()
  //   const job = await models.job.findByPk(1)
  //   await job.update({ startAfter: addMinutes(date, 5) })

  //   const response = await request(server)
  //     .post('/graphql')
  //     .send(
  //       acquireJob({
  //         typeList: ['a'],
  //       })
  //     )

  //   expect(response.body.errors).toBeUndefined()
  //   expect(response.body.data.acquireJob).toBe(null)

  //   // A few milli-seconds passed, so the job should be returned
  //   await job.update({ startAfter: date })

  //   const response2 = await request(server)
  //     .post('/graphql')
  //     .send(
  //       acquireJob({
  //         typeList: ['a'],
  //       })
  //     )

  //   expect(response2.body.errors).toBeUndefined()
  //   expect(response2.body.data.acquireJob).not.toBe(null)
  // })
})
