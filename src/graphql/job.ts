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
    actions: ['list', 'update', 'create'],
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

        if (
          ['successful', 'cancelled', 'failed'].includes(args.status) &&
          args.status !== job.status
        ) {
          properties.endedAt = new Date()
        }

        return properties
      }
    }
  }
}
