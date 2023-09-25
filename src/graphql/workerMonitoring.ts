import {
  InAndOutTypes,
  ModelDeclarationType,
  SequelizeModels,
} from 'graphql-sequelize-generator/types'
import { pinged } from './workerMonitoring/pinged'
import { ponged } from './workerMonitoring/ponged'
import { ping } from './workerMonitoring/ping'
import { pong } from './workerMonitoring/pong'

export default function WorkerMonitoringConfiguration(
  types: InAndOutTypes,
  models: SequelizeModels,
  pubSubInstance: any
): ModelDeclarationType {
  return {
    model: models.workerMonitoring,
    actions: ['list'],
    list: {
      before: (findOptions) => {
        return findOptions
      },
    },
    additionalMutations: {
      ping: ping(pubSubInstance),
      pong: pong(pubSubInstance, models),
    },
    additionalSubscriptions: {
      pinged: pinged(pubSubInstance),
      ponged: ponged(pubSubInstance),
    },
  }
}
