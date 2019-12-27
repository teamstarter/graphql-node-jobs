import {
  OutputTypes,
  ModelEndpointsConfiguration,
  SequelizeModels
} from './../types'

export default function JobConfiguration(
  outputTypes: OutputTypes,
  models: SequelizeModels
): ModelEndpointsConfiguration {
  return {
    model: models.job,
    actions: ['list', 'update', 'create'],
    list: {
      before: findOptions => {
        return findOptions
      }
    }
  }
}
