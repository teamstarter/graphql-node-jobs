import getModels from './../models'
import { OutputTypes, ModelEndpointsConfiguration } from './../types'

const models = getModels()

export default function JobConfiguration(
  outputTypes: OutputTypes
): ModelEndpointsConfiguration {
  return {
    model: models.job,
    actions: ['list'],
    list: {
      before: findOptions => {
        return findOptions
      }
    }
  }
}
