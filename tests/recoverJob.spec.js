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
describe('Test the recoverJob mutation', () => {
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
  it('A job failed can be recover ', async () => {
    const steps = {
      'step-1': {
        status: 'waiting',
      },
      'step-2': {
        status: 'waiting',
      },
      'step-3': {
        status: 'waiting',
      },
      'step-4': {
        status: 'waiting',
      },
      'step-5': {
        status: 'waiting',
      },
      'step-6': {
        status: 'waiting',
      },
      'step-7': {
        status: 'waiting',
      },
      'step-8': {
        status: 'waiting',
      },
      'step-9': {
        status: 'waiting',
      },
      'step-10': {
        status: 'waiting',
      },
    }

    const timeout = async (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms))

    const job = await createJob(client, {
      type: 'job-multi-steps',
      status: 'queued',
      isRecoverable: true,
    })
    const result = await checkForJobs({
      typeList: ['job-multi-steps'],
      client,
      processingFunction: async (job, { updateProcessingInfo }) => {
        for (const step of Object.keys(steps)) {
          if ('step-5' === step) {
            throw new Error('step-5 failed')
          }
          steps[step].status = 'done'
          await updateProcessingInfo({ steps })
          await timeout(1000)
        }

        return steps
      },
      looping: false,
    })

    const error = result.output.error.split('\n')[0]
    expect(result).not.toBeUndefined()
    expect(result).not.toBe(null)
    expect(error).toMatchSnapshot()

    const jobEntity = await models.job.findOne({ where: { id: job.id } })
    expect(jobEntity.status).toBe('failed')

    const responseRecoverJob = await request(server)
      .post('/graphql')
      .send(
        recoverJob({
          id: jobEntity.id,
        })
      )

    expect(responseRecoverJob.body.errors).toBeUndefined()
    expect(responseRecoverJob.body.data.recover.status).toMatchSnapshot()
  })

  it('A job must exist to be recovered ', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(
        recoverJob({
          id: 100,
        })
      )

    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].message).toBe('The job does not exist')
  })

  it('A job must have flag isRecoverable to be recovered', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(
        recoverJob({
          id: 1,
        })
      )

    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].message).toBe('The job must be recoverable')
  })

  it('A job must be failed to be recovered', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(
        recoverJob({
          id: 2,
        })
      )

    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].message).toBe('The job must be failed')
  })
})
