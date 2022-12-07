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
describe('Test to cancel job logic', () => {
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

  it('One can request a job cancel', async () => {
    const models = await getModels()
    const job = await createJob(client, {
      type: 'd',
      status: 'queued',
    })
    expect(job.isUpdateAlreadyCalledWhileCancelRequested).toBe(false)
    const result = await checkForJobs({
      typeList: ['d'],
      client,
      processingFunction: async (job, { updateProcessingInfo }) => {
        await updateProcessingInfo({ test: true })
        const updated = await request(server)
          .post('/graphql')
          .send(
            jobUpdate({
              job: { id: job.id, status: 'cancel-requested' },
            })
          )
        await updateProcessingInfo({ toto: false })
        const data = await models.job.findByPk(job.id)
        expect(data.status).toBe('cancel-requested')
        expect(data.isUpdateAlreadyCalledWhileCancelRequested).toBe(true)
        throw new CancelRequestedError()
        return { percent: 10 }
      },
      looping: false,
    })
    const { createdAt, ...rest } = result
    expect(rest).toMatchSnapshot()
    expect(rest.status).toBe('cancelled')
  })

  it('When a job is cancel-requeted an updateProcessingInfo call makes it fail', async () => {
    const models = await getModels()
    const job = await createJob(client, {
      type: 'e',
      status: 'queued',
    })
    expect(job.isUpdateAlreadyCalledWhileCancelRequested).toBe(false)
    const result = await checkForJobs({
      typeList: ['e'],
      client,
      processingFunction: async (job, { updateProcessingInfo }) => {
        await updateProcessingInfo({ test: true })
        const updated = await request(server)
          .post('/graphql')
          .send(
            jobUpdate({
              job: { id: job.id, status: 'cancel-requested' },
            })
          )
        await updateProcessingInfo({ toto: false })
        const data = await models.job.findByPk(job.id)
        expect(data.status).toBe('cancel-requested')
        expect(data.isUpdateAlreadyCalledWhileCancelRequested).toBe(true)
        await updateProcessingInfo({ titi: true })
        return { percent: 10 }
      },
      looping: false,
    })
    const { createdAt, ...rest } = result
    rest.output.error = rest.output.error.split('\n')[0]
    expect(rest).toMatchSnapshot()
    expect(rest.status).toBe('failed')
  })
  it('The job can be cancelled on cancel request', async () => {
    const models = await getModels()
    const job = await createJob(client, {
      type: 'f',
      status: 'queued',
    })
    expect(job.isUpdateAlreadyCalledWhileCancelRequested).toBe(false)
    const result = await checkForJobs({
      typeList: ['f'],
      client,
      processingFunction: async (job, { updateProcessingInfo }) => {
        const updated = await request(server)
          .post('/graphql')
          .send(
            jobUpdate({
              job: { id: job.id, status: 'cancel-requested' },
            })
          )
        const data = await models.job.findByPk(job.id)
        expect(data.status).toBe('cancel-requested')
        await updateProcessingInfo({ test: true })
        return { percent: 10 }
      },
      looping: false,
      isCancelledOnCancelRequest: true,
    })
    const { createdAt, ...rest } = result
    expect(rest).toMatchSnapshot()
    expect(rest.status).toBe('cancelled')
  })

  it('The job is instantly cancelled when not already started', async () => {
    const job = await createJob(client, {
      type: 'f',
      status: 'queued',
    })
    expect(job.isUpdateAlreadyCalledWhileCancelRequested).toBe(false)

    const response = await request(server)
      .post('/graphql')
      .send(
        jobUpdate({
          job: { id: job.id, status: 'cancel-requested' },
        })
      )

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data).toMatchSnapshot()
  })
})
