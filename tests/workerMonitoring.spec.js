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

const workerMonitoring = (variables) => ({
  query: `query($where: SequelizeJSON) {
    workerMonitoring\(where: $where) {
      id
      workerId
      lastCalledAt
    }
  }`,
  variables,
  operationName: null,
})

/**
 * Starting the tests
 */
describe('Test the workerMonitoring endpoint', () => {
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

  it('WorkerMonitoring is updated when a new job is acquired', async () => {
    const job1 = await createJob(client, { type: 'worker', workerId: '1' })
    const responseJob1 = await request(server)
      .post('/graphql')
      .send(
        acquireJob({
          typeList: ['worker'],
          workerId: '1',
        })
      )
    expect(responseJob1.body.errors).toBeUndefined()
    expect(responseJob1.body.data).toMatchSnapshot()
    const responseWorkerMonitoring = await request(server)
      .post('/graphql')
      .send(
        workerMonitoring({
          where: { workerId: '1' },
        })
      )
    expect(responseWorkerMonitoring.body.errors).toBeUndefined()
    expect(
      responseWorkerMonitoring.body.data.workerMonitoring[0]
    ).not.toBeUndefined()

    const lastCalledAt =
      responseWorkerMonitoring.body.data.workerMonitoring[0].lastCalledAt
    const job2 = await createJob(client, { type: 'worker', workerId: '1' })
    const responseJob2 = await request(server)
      .post('/graphql')
      .send(
        acquireJob({
          typeList: ['worker'],
          workerId: '1',
        })
      )
    expect(responseJob2.body.errors).toBeUndefined()
    expect(responseJob2.body.data).toMatchSnapshot()
    const responseWorkerMonitoring2 = await request(server)
      .post('/graphql')
      .send(
        workerMonitoring({
          where: { workerId: '1' },
        })
      )
    expect(
      lastCalledAt <
        responseWorkerMonitoring2.body.data.workerMonitoring[0].lastCalledAt
    ).toBe(true)
  })
})
