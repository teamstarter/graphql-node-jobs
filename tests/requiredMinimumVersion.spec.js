const request = require('supertest')

const {
  migrateDatabase,
  seedDatabase,
  getNewServer,
  getModelsAndInitializeDatabase,
  closeEverything,
  deleteTables,
  resetDatabase,
} = require('./test-database.js')
const {
  checkForJobs,
  createJob,
  getNewClient,
  PRIORITY_LOW,
  PRIORITY_HIGH,
} = require('./../lib/index')

jest.setTimeout(600000)

let server = null
const client = getNewClient(
  `http://localhost:${process.env.PORT || 8080}/graphql`
)

const acquireJobQuery = (variables) => ({
  query: `mutation($typeList: [String!]!, $workerId: String, $workerVersion: String) {
    acquireJob(
      typeList: $typeList
      workerId: $workerId
      workerVersion: $workerVersion
    ) {
      id
      status
      requiredMinimumVersion
    }
  }`,
  variables,
  operationName: null,
})

const jobCreate = (variables) => ({
  query: `mutation($job: jobInput!) {
    jobCreate(job: $job) {
      id
      status
      requiredMinimumVersion
    }
  }`,
  variables,
  operationName: null,
})

const jobUpdate = (variables) => ({
  query: `mutation($job: jobInput!) {
    jobUpdate(job: $job) {
      id
      requiredMinimumVersion
    }
  }`,
  variables,
  operationName: null,
})

const retryJob = (variables) => ({
  query: `mutation($id: Int!) {
    retryJob(id: $id) {
      id
      status
      requiredMinimumVersion
    }
  }`,
  variables,
  operationName: null,
})

const byId = (a, b) => a - b

async function acquireJob(variables) {
  const response = await request(server)
    .post('/graphql')
    .send(acquireJobQuery(variables))
  expect(response.body.errors).toBeUndefined()
  return response.body.data.acquireJob
}

describe('Test the requiredMinimumVersion of jobs', () => {
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

  it('A job created without requiredMinimumVersion can be acquired by any worker.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'version-none'
    const job = await models.job.create({ type, status: 'queued' })
    expect(job.requiredMinimumVersion).toBe(null)

    const acquired = await acquireJob({
      typeList: [type],
      workerVersion: '0.0.1',
    })
    expect(acquired.id).toBe(job.id)
    expect(acquired.requiredMinimumVersion).toBe(null)
  })

  it('A job is not dispatched to a worker reporting a lower version, but is to the ones reporting the same or a greater version.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'version-gated'
    const job = await models.job.create({
      type,
      status: 'queued',
      requiredMinimumVersion: '2.0.0',
    })

    expect(
      await acquireJob({ typeList: [type], workerVersion: '1.9.9' })
    ).toBe(null)
    await job.reload()
    expect(job.status).toBe('queued')

    const acquired = await acquireJob({
      typeList: [type],
      workerId: 'worker-2.0.0',
      workerVersion: '2.0.0',
    })
    expect(acquired.id).toBe(job.id)
    expect(acquired.status).toBe('processing')
    expect(acquired.requiredMinimumVersion).toBe('2.0.0')

    const greaterVersionJob = await models.job.create({
      type,
      status: 'queued',
      requiredMinimumVersion: '2.0.0',
    })
    const acquiredByGreaterVersion = await acquireJob({
      typeList: [type],
      workerVersion: '2.1.0',
    })
    expect(acquiredByGreaterVersion.id).toBe(greaterVersionJob.id)
  })

  it('Versions are compared with the semver precedence, not alphabetically.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'version-semver'
    const job = await models.job.create({
      type,
      status: 'queued',
      requiredMinimumVersion: '1.10.0',
    })

    expect(
      await acquireJob({ typeList: [type], workerVersion: '1.9.0' })
    ).toBe(null)
    expect(
      (await acquireJob({ typeList: [type], workerVersion: 'v1.10.0' })).id
    ).toBe(job.id)
  })

  it('A pre-release does not satisfy the release it precedes.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'version-prerelease'
    const releaseJob = await models.job.create({
      type,
      status: 'queued',
      requiredMinimumVersion: '2.0.0',
    })
    const prereleaseJob = await models.job.create({
      type,
      status: 'queued',
      requiredMinimumVersion: '2.0.0-rc.1',
    })

    // 2.0.0-rc.2 >= 2.0.0-rc.1 but 2.0.0-rc.2 < 2.0.0
    const acquired = await acquireJob({
      typeList: [type],
      workerVersion: '2.0.0-rc.2',
    })
    expect(acquired.id).toBe(prereleaseJob.id)
    expect(
      await acquireJob({ typeList: [type], workerVersion: '2.0.0-rc.2' })
    ).toBe(null)

    expect(
      (await acquireJob({ typeList: [type], workerVersion: '2.0.0' })).id
    ).toBe(releaseJob.id)
  })

  it('Only the jobs whose requiredMinimumVersion is satisfied are dispatched.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'version-mixed'
    const jobs = []
    for (const requiredMinimumVersion of [null, '1.0.0', '1.5.0', '2.0.0']) {
      jobs.push(
        await models.job.create({
          type,
          status: 'queued',
          requiredMinimumVersion,
        })
      )
    }
    const [noRequirementJob, v1Job, v15Job, v2Job] = jobs

    const acquiredIds = []
    for (let i = 0; i < 3; i++) {
      acquiredIds.push(
        (await acquireJob({ typeList: [type], workerVersion: '1.5.0' })).id
      )
    }
    expect(acquiredIds).toEqual([noRequirementJob.id, v1Job.id, v15Job.id])
    expect(
      await acquireJob({ typeList: [type], workerVersion: '1.5.0' })
    ).toBe(null)

    await v2Job.reload()
    expect(v2Job.status).toBe('queued')
  })

  it('A job that cannot be dispatched to a worker does not block the jobs behind it.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'version-priority'
    const gatedJob = await models.job.create({
      type,
      status: 'queued',
      priorityLevel: PRIORITY_HIGH,
      requiredMinimumVersion: '3.0.0',
    })
    const otherJob = await models.job.create({
      type,
      status: 'queued',
      priorityLevel: PRIORITY_LOW,
    })

    expect(
      (await acquireJob({ typeList: [type], workerVersion: '2.0.0' })).id
    ).toBe(otherJob.id)
    expect(
      (await acquireJob({ typeList: [type], workerVersion: '3.0.0' })).id
    ).toBe(gatedJob.id)
  })

  it('A job queued during an acquisition with a requirement the worker does not meet is not dispatched to it.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'version-race'
    const eligibleJob = await models.job.create({ type, status: 'queued' })
    await models.job.create({
      type,
      status: 'queued',
      requiredMinimumVersion: '1.0.0',
    })

    // Queues a job between the listing of the required versions and the
    // acquisition query, with a priority that would make it acquired first.
    let raceJob = null
    models.job.addHook('afterFind', 'queueJobDuringAcquisition', async (
      result,
      options
    ) => {
      if (raceJob || !options.group) {
        return
      }
      raceJob = await models.job.create({
        type,
        status: 'queued',
        priorityLevel: PRIORITY_HIGH,
        requiredMinimumVersion: '9.0.0',
      })
    })

    try {
      const acquired = await acquireJob({
        typeList: [type],
        workerVersion: '2.0.0',
      })
      expect(raceJob).not.toBe(null)
      expect(acquired.id).toBe(eligibleJob.id)
    } finally {
      models.job.removeHook('afterFind', 'queueJobDuringAcquisition')
    }
  })

  it('Workers that do not report their version are not filtered.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'version-unreported'
    const job = await models.job.create({
      type,
      status: 'queued',
      requiredMinimumVersion: '99.0.0',
    })

    expect((await acquireJob({ typeList: [type] })).id).toBe(job.id)
  })

  it('An invalid workerVersion is rejected.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'version-invalid-worker'
    const job = await models.job.create({ type, status: 'queued' })

    for (const workerVersion of ['latest', '1.2', '']) {
      const response = await request(server)
        .post('/graphql')
        .send(acquireJobQuery({ typeList: [type], workerVersion }))
      expect(response.body.errors).toHaveLength(1)
      expect(response.body.errors[0].message).toBe(
        `The workerVersion must be a valid semver version (like "1.2.3"), got "${workerVersion}".`
      )
    }

    await job.reload()
    expect(job.status).toBe('queued')
  })

  it('The requiredMinimumVersion can be set and removed through the GraphQL API.', async () => {
    const created = await request(server)
      .post('/graphql')
      .send(
        jobCreate({
          job: { type: 'version-api', requiredMinimumVersion: '1.2.3' },
        })
      )
    expect(created.body.errors).toBeUndefined()
    expect(created.body.data.jobCreate.status).toBe('queued')
    expect(created.body.data.jobCreate.requiredMinimumVersion).toBe('1.2.3')

    const updated = await request(server)
      .post('/graphql')
      .send(
        jobUpdate({
          job: {
            id: created.body.data.jobCreate.id,
            requiredMinimumVersion: null,
          },
        })
      )
    expect(updated.body.errors).toBeUndefined()
    expect(updated.body.data.jobUpdate.requiredMinimumVersion).toBe(null)
  })

  it('An invalid requiredMinimumVersion is rejected.', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(
        jobCreate({
          job: { type: 'version-invalid-job', requiredMinimumVersion: '1.2' },
        })
      )
    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].message).toContain(
      'requiredMinimumVersion must be a valid semver version (like "1.2.3"), got "1.2".'
    )

    const models = await getModelsAndInitializeDatabase()
    expect(
      await models.job.count({ where: { type: 'version-invalid-job' } })
    ).toBe(0)

    const job = await models.job.create({
      type: 'version-invalid-job',
      status: 'queued',
    })
    await expect(
      job.update({ requiredMinimumVersion: 'next' })
    ).rejects.toThrow('requiredMinimumVersion must be a valid semver version')
  })

  it('A retried job keeps its requiredMinimumVersion.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const job = await models.job.create({
      type: 'version-retry',
      status: 'failed',
      output: {},
      requiredMinimumVersion: '2.0.0',
    })

    const response = await request(server)
      .post('/graphql')
      .send(retryJob({ id: job.id }))
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.retryJob.status).toBe('queued')
    expect(response.body.data.retryJob.requiredMinimumVersion).toBe('2.0.0')
  })

  it('Concurrent acquisitions dispatch each compatible job exactly once.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'version-concurrency'
    const createJobs = (count, requiredMinimumVersion) =>
      Promise.all(
        Array(count)
          .fill(null)
          .map(() =>
            models.job.create({ type, status: 'queued', requiredMinimumVersion })
          )
      )
    const compatibleJobs = [
      ...(await createJobs(5, null)),
      ...(await createJobs(10, '2.0.0')),
    ]
    const incompatibleJobs = await createJobs(5, '3.0.0')

    const results = await Promise.all(
      Array(50)
        .fill(null)
        .map(() =>
          request(server)
            .post('/graphql')
            .send(acquireJobQuery({ typeList: [type], workerVersion: '2.5.0' }))
        )
    )
    results.forEach((response) => {
      expect(response.body.errors).toBeUndefined()
    })

    const acquiredIds = results
      .map((response) => response.body.data.acquireJob)
      .filter((job) => job !== null)
      .map((job) => job.id)
    expect(acquiredIds.sort(byId)).toEqual(
      compatibleJobs.map((job) => job.id).sort(byId)
    )

    const stillQueued = await models.job.findAll({
      where: { type, status: 'queued' },
    })
    expect(stillQueued.map((job) => job.id).sort(byId)).toEqual(
      incompatibleJobs.map((job) => job.id).sort(byId)
    )
  })

  it('checkForJobs only processes the jobs whose requiredMinimumVersion is satisfied by its workerVersion.', async () => {
    const models = await getModelsAndInitializeDatabase()
    const type = 'version-worker'
    // For example scheduled by a migration of the 2.0.0 release.
    const job = await createJob(client, {
      type,
      requiredMinimumVersion: '2.0.0',
    })
    expect((await models.job.findByPk(job.id)).requiredMinimumVersion).toBe(
      '2.0.0'
    )
    const processingFunction = jest.fn(async () => ({ done: true }))

    // A worker still running the previous release ignores the job.
    const oldWorkerResult = await checkForJobs({
      client,
      typeList: [type],
      workerVersion: '1.9.0',
      processingFunction,
      looping: false,
    })
    expect(oldWorkerResult).toBe(null)
    expect(processingFunction).not.toHaveBeenCalled()

    // Once restarted with the new release, it processes it.
    const newWorkerResult = await checkForJobs({
      client,
      typeList: [type],
      workerVersion: '2.0.0',
      processingFunction,
      looping: false,
    })
    expect(newWorkerResult.id).toBe(job.id)
    expect(newWorkerResult.status).toBe('successful')
    expect(processingFunction).toHaveBeenCalledTimes(1)
  })

  it('checkForJobs rejects an invalid workerVersion.', async () => {
    const processingFunction = jest.fn()
    await expect(
      checkForJobs({
        client,
        typeList: ['version-worker-invalid'],
        workerVersion: 'latest',
        processingFunction,
        looping: false,
      })
    ).rejects.toThrow(
      'Please provide a valid semver workerVersion (like "1.2.3"), got "latest".'
    )
    expect(processingFunction).not.toHaveBeenCalled()
  })
})
