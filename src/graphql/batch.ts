import getModels from './../models'
import { OutputTypes, ModelEndpointsConfiguration } from '../types'

const models = getModels()

export default function BatchConfiguration(
  outputTypes: OutputTypes
): ModelEndpointsConfiguration {
  return {
    model: models.batch,
    actions: ['list'],
    list: {
      before: findOptions => {
        return findOptions
      }
    }
  }
}
