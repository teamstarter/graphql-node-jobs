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
} = require('./../lib/index')

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

  it('List the jobs', async () => {
    const response = await request(server).get(
      `/graphql?query=query getJobs {
          job(order:"id") {
            id
            name
          }
        }
        &operationName=getJobs`
    )

    expect(response.body).toMatchSnapshot()
  })

  it('One can create a job of a given type.', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(
        jobCreate({
          job: { name: 'c', type: 'c' },
        })
      )

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data).toMatchSnapshot()
    // By default a created job is always in queued state.
    expect(response.body.data.jobCreate.status).toBe('queued')
  })

  it('One cannot create a job without a type.', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(
        jobCreate({
          job: { name: 'c' },
        })
      )

    expect(response.body.errors).not.toBeUndefined()
  })

  it('One can query the timefields', async () => {
    const response = await request(server).get(
      `/graphql?query=query getJobs {
          job(order:"id") {
            id
            startedAt
            endedAt
            createdAt
            deletedAt
          }
          jobCount
        }
        &operationName=getJobs`
    )

    expect(response.body.errors).toBeUndefined()
  })

  it('Workers can easily query jobs.', async () => {
    const jobs = await listJobs(client)

    expect(jobs).toMatchSnapshot()

    const jobsWhereType = await listJobs(client, { where: { type: 'a' } })

    expect(jobsWhereType).toMatchSnapshot()

    const date = new Date()
    const job = await models.job.findByPk(1)
    await job.update({ startAfter: date })

    const jobsStartAfter = await listJobs(client, {
      where: { startAfter: date },
    })

    expect(jobsStartAfter[0].id).toBe(1)
    expect(jobsStartAfter.length).toBe(1)
  })

  it('Workers can easily create jobs.', async () => {
    const response = await createJob(client, { type: 'c' })

    const { createdAt, ...rest } = response
    expect(rest).toMatchSnapshot()
  })

  it('Check if you cannot duplicate job according to jobUniqueId', async () => {
    const responseCreateJob = await request(server)
      .post('/graphql')
      .send(
        jobCreate({
          job: { name: 'c', type: 'c', jobUniqueId: 'job-unique-1' },
        })
      )
    expect(responseCreateJob.body.errors).toBeUndefined()
    expect(responseCreateJob.body.data).toMatchSnapshot()

    const responseSameCreateJob = await request(server)
      .post('/graphql')
      .send(
        jobCreate({
          job: { name: 'c', type: 'c', jobUniqueId: 'job-unique-1' },
        })
      )

    expect(responseCreateJob.body.errors).toBeUndefined()
    expect(responseSameCreateJob.body.data).toStrictEqual(
      responseCreateJob.body.data
    )
  })

  it('Step are properly timed when they are finished', async () => {
    const timeout = async (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms))

    const job = await createJob(client, {
      type: 'job-multi-steps',
      status: 'queued',
    })
    const result = await checkForJobs({
      typeList: ['job-multi-steps'],
      client,
      processingFunction: async (job, { updateProcessingInfo }) => {
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
        }

        for (const step of Object.keys(steps)) {
          steps[step].status = 'done'
          await updateProcessingInfo({ steps })
          await timeout(1000)
        }

        return steps
      },
      looping: false,
    })
    const { createdAt, processingInfo } = result

    const steps = processingInfo.steps
    Object.keys(steps).forEach((step) => {
      expect(steps[step].status).toBe('done')
      expect(steps[step].elapsedTime).toBeGreaterThanOrEqual(1000)
      expect(steps[step].elapsedTime).toBeLessThan(1100)
    })
  })
})
