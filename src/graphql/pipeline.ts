import {
  OutputTypes,
  ModelEndpointsConfiguration,
  SequelizeModels
} from '../types'

export default function PipelineConfiguration(
  outputTypes: OutputTypes,
  models: SequelizeModels
): ModelEndpointsConfiguration {
  return {
    model: models.pipeline,
    actions: ['list', 'update', 'create', 'count'],
    list: {
      before: findOptions => {
        return findOptions
      }
    }
  }
}
