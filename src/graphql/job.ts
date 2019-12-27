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
    }
  }
}
