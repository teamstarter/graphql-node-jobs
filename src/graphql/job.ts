import {
  ModelDeclarationType,
  SequelizeModels,
  InAndOutTypes,
} from 'graphql-sequelize-generator/types'

import acquireJob from './job/acquire'

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

        return properties
      },
    },
  }
}
