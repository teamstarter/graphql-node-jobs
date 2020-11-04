import {
  ModelEndpointsConfiguration,
  SequelizeModels,
  InAndOutGraphqlTypes
} from './../types'
import acquireJob from './job/acquire'

export default function JobConfiguration(
  graphqlTypes: InAndOutGraphqlTypes,
  models: SequelizeModels
): ModelEndpointsConfiguration {
  return {
    model: models.job,
    actions: ['list', 'update', 'create', 'count'],
    additionalMutations: {
      acquireJob: acquireJob(graphqlTypes, models)
    },
    list: {
      before: findOptions => {
        return findOptions
      }
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
          args.status !== job.status
        ) {
          properties.endedAt = new Date()
        }

        // We set the start date when the status switch to processing.
        if ('processing' === args.job.status && job.status === 'queued') {
          properties.startedAt = new Date()
        }

        return properties
      }
    }
  }
}
