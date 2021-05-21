import {
  ModelDeclarationType,
  SequelizeModels,
  InAndOutTypes,
} from 'graphql-sequelize-generator/types'
import debounce from 'debounce'

import acquireJob from './job/acquire'
import retryJob from './job/retry'

// You will throw a CancelRequestedError in your application to set the job status to 'cancelled'
export class CancelRequestedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CancelRequestedError'
  }
}

const allInstanceOfDebounceBatch: any = []

function getInstanceOfDebounceBatch(batchId: number) {
  const instance = allInstanceOfDebounceBatch.filter(
    (instance: any) => instance.batchId === batchId
  )

  if (!instance.length) {
    allInstanceOfDebounceBatch.push({
      batchId: batchId,
      debounce: debounce((callback: Function) => callback(), 50),
    })

    return allInstanceOfDebounceBatch.filter(
      (instance: any) => instance.batchId === batchId
    )[0].debounce
  }

  return instance[0].debounce
}

export default function JobConfiguration(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels
): ModelDeclarationType {
  return {
    model: models.job,
    actions: ['list', 'update', 'create', 'count'],
    subscriptions: ['create', 'update', 'delete'],
    additionalMutations: {
      acquireJob: acquireJob(graphqlTypes, models),
      retryJob: retryJob(graphqlTypes, models),
    },
    list: {
      before: (findOptions) => {
        return findOptions
      },
    },
    update: {
      before: async (findOptions, args, context, info) => {
        const properties = args.job

        const job = await models.job.findByPk(args.job.id)
        if (!job) {
          throw new Error(`Could not find the job with the id [${job.id}]`)
        }

        // We set the end date when the status switch to a terminating state.
        // End date can be either a success or a failure.
        if (
          ['successful', 'cancelled', 'failed'].includes(args.job.status) &&
          args.job.status !== job.status
        ) {
          properties.endedAt = new Date()
        }

        if (
          job.status === 'cancel-requested' &&
          (!args.job.status || args.job.status === job.status)
        ) {
          if (job.isUpdateAlreadyCalledWhileCancelRequested) {
            properties.status = 'cancelled'
            properties.cancelledAt = new Date()
            throw new Error(
              'The job was requested to be cancelled at the previous call. Please check for the status "cancel-requested" after calling updateProcessingInfo in your worker and throw a CancelRequestedError'
            )
          } else {
            properties.isUpdateAlreadyCalledWhileCancelRequested = true
          }
        }

        // We set the start date when the status switch to processing.
        if ('processing' === args.job.status && job.status === 'queued') {
          properties.startedAt = new Date()
        }

        // We set the cancelled date when the status switches.
        if ('cancelled' === args.job.status && job.status !== args.job.status) {
          properties.cancelledAt = new Date()
        }

        // Queued job are instantly cancelled when requested to be cancelled.
        if (args.job.status === 'cancel-requested' && job.status === 'queued') {
          properties.status = 'cancelled'
        }

        return properties
      },
      after: async (job, oldJob) => {
        if (!job.batchId) {
          return job
        }

        const debounceBatch = getInstanceOfDebounceBatch(job.batchId)

        debounceBatch(async () => {
          const batch = await models.batch.findOne({
            where: { id: job.batchId },
          })
          const jobs = await models.job.findAll({
            where: {
              batchId: job.batchId,
            },
          })
          const jobsStatus = jobs.map((job) => job.status)
          const allJobsAreSuccessful = jobsStatus.every(
            (status) => status === 'successful'
          )

          if (allJobsAreSuccessful) {
            await batch.update({
              status: 'successful',
            })
          } else if (jobsStatus.includes('failed')) {
            await batch.update({
              status: 'failed',
            })
          }
        })

        return job
      },
    },
  }
}
