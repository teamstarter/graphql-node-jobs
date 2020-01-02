const request = require('supertest')
const {
  migrateDatabase,
  seedDatabase,
  getNewServer,
  models,
  closeEverything,
  deleteTables,
  resetDatabase
} = require('./test-database.js')
const { checkForJobs } = require('./../lib/index')

let server = null
const uri = `http://localhost:${process.env.PORT || 8080}/graphql`

const acquireJob = variables => ({
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
  operationName: null
})

const jobCreate = variables => ({
  query: `mutation($job: jobInput!) {
    jobCreate(
      job: $job
    ) {
      id
      name
      status
      output
    }
  }`,
  variables,
  operationName: null
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

  afterAll(async done => {
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
    const response = await request(server)
      .post('/graphql')
      .send(acquireJob({}))

    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].message).toMatchSnapshot()
  })

  it('One can acquire a job of a given type.', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(
        acquireJob({
          typeList: ['a']
        })
      )

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data).toMatchSnapshot()

    const response2 = await request(server)
      .post('/graphql')
      .send(
        acquireJob({
          typeList: ['a']
        })
      )

    expect(response2.body.errors).toBeUndefined()
    expect(response2.body.data.acquireJob).toBe(null)
  })

  it('checkForJobs allows to simply acquire and update jobs.', async () => {
    const job = await checkForJobs({
      typeList: ['a'],
      uri,
      processingFunction: job => {
        return { total: 125 }
      },
      looping: false
    })
    expect(job).not.toBeUndefined()
    expect(job).not.toBe(null)
    expect(job).toMatchSnapshot()
  })

  it('checkForJobs allows to simply acquire multiple types of jobs at the same time.', async () => {
    const job = await checkForJobs({
      typeList: ['a', 'b'],
      uri,
      processingFunction: job => {
        return { total: 125 }
      },
      looping: false
    })
    expect(job).not.toBeUndefined()
    expect(job).not.toBe(null)
    expect(job).toMatchSnapshot()

    const job2 = await checkForJobs({
      typeList: ['a', 'b'],
      uri,
      processingFunction: job => {
        return { total: 125 }
      },
      looping: false
    })
    expect(job2).not.toBeUndefined()
    expect(job2).not.toBe(null)
    expect(job2).toMatchSnapshot()
  })

  it('checkForJobs allows to asynchronous processing functions.', async () => {
    const job = await checkForJobs({
      typeList: ['a', 'b'],
      uri,
      processingFunction: async job => {
        const result = await new Promise((resolve, reject) =>
          setTimeout(() => {
            resolve('plop')
          }, 100)
        )
        return { total: result }
      },
      looping: false
    })
    expect(job).not.toBeUndefined()
    expect(job).not.toBe(null)
    expect(job).toMatchSnapshot()

    const jobEntity = await models.job.findOne({ where: { id: job.id } })
    expect(jobEntity.startedAt).not.toBe(null)
    expect(jobEntity.endedAt).not.toBe(null)
  })

  it('One can create a job of a given type.', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(
        jobCreate({
          job: { name: 'c', type: 'c' }
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
          job: { name: 'c' }
        })
      )

    expect(response.body.errors).not.toBeUndefined()
  })

  it('One cannot create a job without a type.', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(
        jobCreate({
          job: { name: 'c' }
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
        }
        &operationName=getJobs`
    )

    expect(response.body.errors).toBeUndefined()
  })
})
