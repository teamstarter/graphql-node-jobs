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
