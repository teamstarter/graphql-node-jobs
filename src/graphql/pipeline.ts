import getModels from './../models'
import { OutputTypes, ModelEndpointsConfiguration } from '../types'

const models = getModels()

export default function PipelineConfiguration(
  outputTypes: OutputTypes
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
