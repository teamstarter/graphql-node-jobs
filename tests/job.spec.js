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

const { cleanupTestsEnv } = require('./tools')

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

const batchCreate = (variables) => ({
  query: `mutation batchCreate($batch: batchInput!){
    batchCreate(batch: $batch) {
      id
      pipelineId
      status
    }
  }`,
  variables,
  operationName: null,
})

const batch = (variables) => ({
  query: `query batch($where: SequelizeJSON!){
    batch(where: $where) {
      id
      pipelineId
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
    cleanupTestsEnv()
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

  it('Acquiring a job require a type', async () => {
    const response = await request(server).post('/graphql').send(acquireJob({}))

    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].message).toMatchSnapshot()
  })

  it('One can acquire a job of a given type.', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(
        acquireJob({
          typeList: ['a'],
        })
      )

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data).toMatchSnapshot()

    const response2 = await request(server)
      .post('/graphql')
      .send(
        acquireJob({
          typeList: ['a'],
        })
      )

    expect(response2.body.errors).toBeUndefined()
    expect(response2.body.data.acquireJob).toBe(null)
  })

  it('checkForJobs allows to simply acquire and update jobs.', async () => {
    const job = await checkForJobs({
      typeList: ['a'],
      client,
      processingFunction: (job) => {
        return { total: 125 }
      },
      looping: false,
    })
    expect(job).not.toBeUndefined()
    expect(job).not.toBe(null)
    expect(job).toMatchSnapshot()
  })

  it('checkForJobs allows to simply acquire multiple types of jobs at the same time.', async () => {
    const job = await checkForJobs({
      typeList: ['a', 'b'],
      client,
      processingFunction: (job) => {
        return { total: 125 }
      },
      looping: false,
    })
    expect(job).not.toBeUndefined()
    expect(job).not.toBe(null)
    expect(job).toMatchSnapshot()

    const job2 = await checkForJobs({
      typeList: ['a', 'b'],
      client,
      processingFunction: (job) => {
        return { total: 125 }
      },
      looping: false,
    })
    expect(job2).not.toBeUndefined()
    expect(job2).not.toBe(null)
    expect(job2).toMatchSnapshot()
  })

  it('checkForJobs allows to asynchronous processing functions.', async () => {
    const job = await checkForJobs({
      typeList: ['a', 'b'],
      client,
      processingFunction: async (job) => {
        const result = await new Promise((resolve, reject) =>
          setTimeout(() => {
            resolve('plop')
          }, 100)
        )
        return { total: result }
      },
      looping: false,
    })
    expect(job).not.toBeUndefined()
    expect(job).not.toBe(null)
    expect(job).toMatchSnapshot()

    const jobEntity = await models.job.findOne({ where: { id: job.id } })
    expect(jobEntity.startedAt).not.toBe(null)
    expect(jobEntity.endedAt).not.toBe(null)
  })

  it('checkForJobs declare jobs as failed when an error is raised.', async () => {
    const job = await checkForJobs({
      typeList: ['a'],
      client,
      processingFunction: async () => {
        const a = {}
        a.awd()
        return a
      },
      looping: false,
    })
    const error = job.output.error.split('\n')[0]
    expect(job).not.toBeUndefined()
    expect(job).not.toBe(null)
    expect(error).toMatchSnapshot()

    const jobEntity = await models.job.findOne({ where: { id: 1 } })
    expect(jobEntity.startedAt).not.toBe(null)
    expect(jobEntity.endedAt).not.toBe(null)
    expect(jobEntity.status).toBe('failed')
    expect(jobEntity.output.error.search('at processingFunction')).not.toBe(-1)
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

  it('checkForJobs processing function can return nothing if needed.', async () => {
    const job = await checkForJobs({
      typeList: ['a'],
      client,
      processingFunction: async () => {},
      looping: false,
    })
    expect(job).not.toBeUndefined()
    expect(job).not.toBe(null)
    expect(job).toMatchSnapshot()

    const jobEntity = await models.job.findOne({ where: { id: 1 } })
    expect(jobEntity.startedAt).not.toBe(null)
    expect(jobEntity.endedAt).not.toBe(null)
    expect(jobEntity.status).toBe('successful')
    expect(jobEntity.output).toMatchSnapshot()
  })

  it('The processingFunction expose .', async () => {
    const job = await checkForJobs({
      typeList: ['a'],
      client,
      processingFunction: async (job, { updateProcessingInfo }) => {
        await updateProcessingInfo({ percent: 10 })
      },
      looping: false,
    })
    expect(job).not.toBeUndefined()
    expect(job).not.toBe(null)
    expect(job).toMatchSnapshot()

    const jobEntity = await models.job.findOne({ where: { id: 1 } })
    expect(jobEntity.startedAt).not.toBe(null)
    expect(jobEntity.endedAt).not.toBe(null)
    expect(jobEntity.status).toBe('successful')
    expect(jobEntity.output).toMatchSnapshot()
    expect(jobEntity.processingInfo).toMatchSnapshot()
  })

  it('When a job is planified to be run in the future, it cannot be acquired.', async () => {
    const date = new Date()
    const job = await models.job.findByPk(1)
    await job.update({ startAfter: addMinutes(date, 5) })

    const response = await request(server)
      .post('/graphql')
      .send(
        acquireJob({
          typeList: ['a'],
        })
      )

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.acquireJob).toBe(null)

    // A few milli-seconds passed, so the job should be returned
    await job.update({ startAfter: date })

    const response2 = await request(server)
      .post('/graphql')
      .send(
        acquireJob({
          typeList: ['a'],
        })
      )

    expect(response2.body.errors).toBeUndefined()
    expect(response2.body.data.acquireJob).not.toBe(null)
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

  it('One can add his own mutations to the schema', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(customAcquire({ typeList: ['c'] }))

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data).toMatchSnapshot()
  })

  it('One can request a job cancel', async () => {
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

  it('Check if you cannot duplicate job according to jobUniqueId', async () => {
    const responseCreateJob = await request(server)
      .post('/graphql')
      .send(
        jobCreate({
          job: { name: 'c', type: 'c', jobUniqueId: 'job-unique-10' },
        })
      )
    expect(responseCreateJob.body.errors).toBeUndefined()
    const responseSameCreateJob = await request(server)
      .post('/graphql')
      .send(
        jobCreate({
          job: { name: 'c', type: 'c', jobUniqueId: 'job-unique-10' },
        })
      )

    expect(responseCreateJob.body.errors).toBeUndefined()
    expect(responseSameCreateJob.body.data).toStrictEqual(
      responseCreateJob.body.data
    )
  })
  it('The job can be restarted if it fails', async () => {
    const responseRetryJob = await request(server)
      .post('/graphql')
      .send(
        retryJob({
          id: 3,
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
      'The job must be failed.'
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

  it('List the jobs with and without highFrequency', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(
        jobList({
          where: { isHighFrequency: false },
        })
      )

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data).toMatchSnapshot()

    const response2 = await request(server)
      .post('/graphql')
      .send(
        jobList({
          where: { isHighFrequency: true },
        })
      )

    expect(response2.body.errors).toBeUndefined()
    expect(response2.body.data).toMatchSnapshot()
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

  it('If job fail the associated batch fail', async () => {
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

  it('When job is create he have a status queued', async () => {
    const job = await createJob(client, {
      type: 'a',
    })

    expect(job.status).toBe('queued')
  })

  it('Job add to a pipeline have a status planned', async () => {
    const job = await createJob(client, {
      type: 'a',
      pipelineId: 2,
    })

    expect(job.status).toBe('planned')
  })

  it('Job add to a pipeline create a new pipelineStep', async () => {
    const job = await createJob(client, {
      type: 'a',
      pipelineId: 2,
    })

    const step = await models.pipelineStep.findOne({
      where: { jobId: job.id },
    })

    expect(step).not.toBeUndefined()
  })

  it('When a job linked to a step is successful the status of the next step job are switched to queued', async () => {
    const job1 = await createJob(client, {
      name: 'job-1',
      type: 'a',
      pipelineId: 1,
    })
    expect(job1.status).toBe('planned')

    const job2 = await createJob(client, {
      name: 'job-2',
      type: 'a',
      pipelineId: 1,
    })
    expect(job2.status).toBe('planned')

    const updated = await request(server)
      .post('/graphql')
      .send(
        jobUpdate({
          job: { id: job1.id, status: 'successful' },
        })
      )

    const job2Updated = await models.job.findByPk(job2.id)

    expect(job2Updated.status).toBe('queued')
  })

  it('When a job linked to a step is successful the status of all jobs of batch of the next step are switched to queued', async () => {
    const job1 = await createJob(client, {
      name: 'job-1',
      type: 'a',
      pipelineId: 1,
    })
    expect(job1.status).toBe('planned')

    const responseBatchCreate = await request(server)
      .post('/graphql')
      .send(
        batchCreate({
          batch: { pipelineId: 1 },
        })
      )

    const batchId = responseBatchCreate.body.data.batchCreate.id

    const job2 = await createJob(client, {
      name: 'job-2',
      type: 'a',
      batchId,
    })
    expect(job2.status).toBe('planned')

    const job3 = await createJob(client, {
      name: 'job-3',
      type: 'a',
      batchId,
    })
    expect(job3.status).toBe('planned')

    const updated = await request(server)
      .post('/graphql')
      .send(
        jobUpdate({
          job: { id: job1.id, status: 'successful' },
        })
      )

    const job2Updated = await models.job.findByPk(job2.id)
    const job3Updated = await models.job.findByPk(job3.id)

    expect(job2Updated.status).toBe('queued')
    expect(job3Updated.status).toBe('queued')
  })

  it('Batch will be successful when all his job are successful', async () => {
    const job1 = await createJob(client, {
      name: 'job-1',
      type: 'a',
      pipelineId: 1,
    })

    const responseBatchCreate = await request(server)
      .post('/graphql')
      .send(
        batchCreate({
          batch: { pipelineId: 1 },
        })
      )
    const batchId = responseBatchCreate.body.data.batchCreate.id

    const job2 = await createJob(client, {
      name: 'job-2',
      type: 'a',
      batchId,
    })

    const job3 = await createJob(client, {
      name: 'job-3',
      type: 'a',
      batchId,
    })

    await request(server)
      .post('/graphql')
      .send(
        jobUpdate({
          job: { id: job1.id, status: 'successful' },
        })
      )

    await request(server)
      .post('/graphql')
      .send(
        jobUpdate({
          job: { id: job2.id, status: 'successful' },
        })
      )

    const updatedJob3 = await request(server)
      .post('/graphql')
      .send(
        jobUpdate({
          job: { id: job3.id, status: 'successful' },
        })
      )

    await wait(100)

    const responseBatchUpdated = await request(server)
      .post('/graphql')
      .send(
        batch({
          where: { id: batchId },
        })
      )

    expect(responseBatchUpdated.body.errors).toBeUndefined()
    expect(responseBatchUpdated.body.data.batch[0].status).toBe('successful')

    const pipeline = await models.pipeline.findByPk(1)
    expect(pipeline.status).toBe('successful')
  })
})
