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
    actions: ['list'],
    list: {
      before: findOptions => {
        return findOptions
      }
    }
  }
}
