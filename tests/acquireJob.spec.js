const request = require('supertest')
const addMinutes = require('date-fns/addMinutes')
const { canUseRowLevelLocking } = require('../lib/graphql/job')

const {
  migrateDatabase,
  seedDatabase,
  getNewServer,
  getModelsAndInitializeDatabase,
  closeEverything,
  deleteTables,
  resetDatabase,
} = require('./test-database.js')
jest.setTimeout(600000)

let server = null

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
    const models = await getModelsAndInitializeDatabase()
    await closeEverything(server, models, done)
  })

  it('Acquiring a job requires a type', async () => {
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

  it('When a job is scheduled to be run in the future, it cannot be acquired.', async () => {
    const date = new Date()
    const models = await getModelsAndInitializeDatabase()
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

    await job.update({ startAfter: date })
    await new Promise((resolve) => setTimeout(resolve, 1000))
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

  it('One cannot acquire a job of a blacklisted type.', async () => {
    const models = await getModelsAndInitializeDatabase()
    await models.job.create({ type: 'blacklisted' })
    await models.jobHoldType.create({ type: 'blacklisted' })
    await models.jobHoldType.create({ type: 'blacklisted2' })
    const response = await request(server)
      .post('/graphql')
      .send(
        acquireJob({
          typeList: ['blacklisted'],
        })
      )

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data).toMatchSnapshot()
  })

  it('Concurrent job acquiring should only allow one acquisition', async () => {
    // Send multiple "concurrent" requests to acquire the same type of job
    const typeList = ['a']
    const requestPromises = Array(100)
      .fill(null)
      .map(() =>
        request(server).post('/graphql').send(acquireJob({ typeList }))
      )

    // Wait for all the requests to finish
    const results = await Promise.all(requestPromises)

    // Filter responses to only those that were successful in acquiring a job
    const successfulAcquisitions = results.filter(
      (response) => response.body.data && response.body.data.acquireJob !== null
    )

    // Ensure that only one request was successful in acquiring the job
    expect(successfulAcquisitions.length).toBe(1)
    expect(successfulAcquisitions[0].body.data).toMatchSnapshot()

    // Check the remaining responses to confirm that they did not acquire the job
    const failedAcquisitions = results.filter(
      (response) => response.body.data && response.body.data.acquireJob === null
    )

    // Expect that 99 out of 100 attempts failed to acquire the job due to it already being acquired
    expect(failedAcquisitions.length).toBe(99)

    // Verify that there were no unexpected GraphQL errors across all responses
    results.forEach((response) => {
      expect(response.body.errors).toBeUndefined()
    })
  })
  it('Concurrent job acquiring should fetch jobs only once', async () => {
    const models = await getModelsAndInitializeDatabase()
    // Count existing queued jobs in the database
    const existingJobs = await models.job.findAll({
      where: { status: 'queued', type: 'a' },
    })
    const existingJobCount = existingJobs.length
    // Create additional jobs
    const type = 'a'
    const numberOfJobsToCreate = 15
    const jobs = await Promise.all(
      Array(numberOfJobsToCreate)
        .fill(null)
        .map(() =>
          models.job.create({
            type,
            status: 'queued',
          })
        )
    )

    // Send multiple "concurrent" requests to acquire jobs
    const requestPromises = Array(100)
      .fill(null)
      .map(() =>
        request(server)
          .post('/graphql')
          .send(acquireJob({ typeList: [type] }))
      )
    const results = await Promise.all(requestPromises)

    // Filter responses to those that successfully acquired a job
    const successfulAcquisitions = results.filter(
      (response) => response.body.data && response.body.data.acquireJob !== null
    )

    // Ensure that the number of successful acquisitions matches the total number of jobs
    const totalJobs = existingJobCount + numberOfJobsToCreate
    expect(successfulAcquisitions.length).toBe(totalJobs)

    // Verify that each acquired job is unique
    const acquiredJobIds = successfulAcquisitions.map(
      (response) => response.body.data.acquireJob.id
    )
    const uniqueJobIds = new Set(acquiredJobIds)
    expect(uniqueJobIds.size).toBe(totalJobs)

    // Check that all jobs (existing + newly created) have been acquired exactly once
    const allJobIds = [
      ...existingJobs.map((job) => job.id),
      ...jobs.map((job) => job.id),
    ]
    expect(acquiredJobIds.sort()).toEqual(allJobIds.sort())

    // Verify that the remaining responses did not acquire any job
    const failedAcquisitions = results.filter(
      (response) => response.body.data && response.body.data.acquireJob === null
    )
    expect(failedAcquisitions.length).toBe(100 - totalJobs)

    // Ensure there were no unexpected GraphQL errors across all responses
    results.forEach((response) => {
      expect(response.body.errors).toBeUndefined()
    })
  })
})
