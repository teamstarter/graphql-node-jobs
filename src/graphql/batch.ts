import {
  OutputTypes,
  ModelEndpointsConfiguration,
  SequelizeModels
} from './../types'

export default function BatchConfiguration(
  outputTypes: OutputTypes,
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
