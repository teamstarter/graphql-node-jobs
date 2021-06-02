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

const startPipeline = (variables) => ({
  query: `mutation($id: Int!) {
    startPipeline(id: $id) {
      id
      name
      status
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

/**
 * Starting the tests
 */
describe('Test the pipeline', () => {
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

  it('A pipeline can be started', async () => {
    const pipeline = await models.pipeline.findByPk(2)
    expect(pipeline.status).toBe('planned')

    const responseStartPipeline = await request(server)
      .post('/graphql')
      .send(
        startPipeline({
          id: 2,
        })
      )

    expect(responseStartPipeline.body.errors).toBeUndefined()
    expect(responseStartPipeline.body.data.startPipeline.status).toBe(
      'processing'
    )

    const step = await models.pipelineStep.findOne({
      where: {
        pipelineId: pipeline.id,
        index: 1,
      },
    })

    const job = await models.job.findOne({
      where: {
        id: step.jobId,
      },
    })

    expect(job.status).toBe('queued')
  })

  it('A pipeline can be successful', async () => {
    const job1 = await createJob(client, {
      name: 'job-1',
      type: 'a',
      pipelineId: 1,
    })

    const job2 = await createJob(client, {
      name: 'job-2',
      type: 'a',
      pipelineId: 1,
    })

    const steps = await models.pipelineStep.findAll({ where: {} })

    const updatedJob1 = await request(server)
      .post('/graphql')
      .send(
        jobUpdate({
          job: { id: job1.id, status: 'successful' },
        })
      )

    const updatedJob2 = await request(server)
      .post('/graphql')
      .send(
        jobUpdate({
          job: { id: job2.id, status: 'successful' },
        })
      )

    await wait(100)
    const pipeline = await models.pipeline.findByPk(1)
    expect(pipeline.status).toBe('successful')
  })

  it('A pipeline can be failed', async () => {
    const job1 = await createJob(client, {
      name: 'job-1',
      type: 'a',
      pipelineId: 1,
    })

    const job2 = await createJob(client, {
      name: 'job-2',
      type: 'a',
      pipelineId: 1,
    })

    const updatedJob1 = await request(server)
      .post('/graphql')
      .send(
        jobUpdate({
          job: { id: job1.id, status: 'successful' },
        })
      )

    const updatedJob2 = await request(server)
      .post('/graphql')
      .send(
        jobUpdate({
          job: { id: job2.id, status: 'failed' },
        })
      )

    const pipeline = await models.pipeline.findByPk(1)
    expect(pipeline.status).toBe('failed')
  })
})
