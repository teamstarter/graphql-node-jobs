import {
  ModelDeclarationType,
  SequelizeModels,
  InAndOutTypes,
} from 'graphql-sequelize-generator/types'

import acquireJob from './job/acquire'

// You will throw a CancelRequestedError in your application to set the job status to 'cancelled'
export class CancelRequestedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CancelRequestedError'
  }
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

        let newProcessingInfo = null
        if (
          typeof args.job.processingInfo !== 'string' &&
          typeof args.job.processingInfo !== 'number' &&
          typeof args.job.processingInfo !== 'boolean' &&
          !Array.isArray(args.job.processingInfo) &&
          typeof args.job.processingInfo?.steps !== 'undefined' &&
          typeof args.job.processingInfo.steps !== null
        ) {
          const steps: any = args.job.processingInfo.steps
          newProcessingInfo = Object.keys(steps as Object).reduce(
            (acc: any, stepName: string) => {
              const newStep = steps[stepName]

              if (newStep.status === 'done' && newStep?.doneAt === undefined) {
                const time = new Date()
                const prevTime = new Date(job.updatedAt)
                newStep.doneAt = time
                newStep.elapsedTime = time.getTime() - prevTime.getTime()
              }

              acc[stepName] = newStep
              return acc
            },
            {}
          )

          properties.steps = newProcessingInfo
        }
        return properties
      },
    },
  }
}
