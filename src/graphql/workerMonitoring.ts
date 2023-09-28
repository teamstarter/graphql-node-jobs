import {
  InAndOutTypes,
  ModelDeclarationType,
  SequelizeModels,
} from 'graphql-sequelize-generator/types'
import { pinged } from './workerMonitoring/subscriptions/pinged'
import { ponged } from './workerMonitoring/subscriptions/ponged'
import { ping } from './workerMonitoring/mutations/ping'
import { pong } from './workerMonitoring/mutations/pong'
import { workerMonitorUpdated } from './workerMonitoring/subscriptions/workerMonitoringUpdated'
import { workerMonitorUpdate } from './workerMonitoring/mutations/workerMonitorUpdate'

export function workerMonitoring(
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
      pong: pong(pubSubInstance),
      workerMonitoringUpdate: workerMonitorUpdate(pubSubInstance, models),
    },
    additionalSubscriptions: {
      pinged: pinged(pubSubInstance),
      ponged: ponged(pubSubInstance),
      workerMonitoringUpdated: workerMonitorUpdated(pubSubInstance),
    },
  }
}
