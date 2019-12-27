import {
  ModelEndpointsConfiguration,
  SequelizeModels,
  InAndOutGraphqlTypes
} from './../types'

export default function BatchConfiguration(
  graphqlTypes: InAndOutGraphqlTypes,
  models: SequelizeModels
): ModelEndpointsConfiguration {
  return {
    model: models.batch,
    actions: ['list', 'update', 'create'],
    list: {
      before: findOptions => {
        return findOptions
      }
    }
  }
}
