import {
    ModelDeclarationType,
    SequelizeModels
} from '@teamstarter/graphql-sequelize-generator/src/types/types'
import { ping } from './workerMonitoring/mutations/ping'
import { pong } from './workerMonitoring/mutations/pong'
import { workerMonitorUpdate } from './workerMonitoring/mutations/workerMonitorUpdate'
import { pinged } from './workerMonitoring/subscriptions/pinged'
import { ponged } from './workerMonitoring/subscriptions/ponged'
import { workerMonitorUpdated } from './workerMonitoring/subscriptions/workerMonitoringUpdated'

export function workerMonitoring(
  models: SequelizeModels,
  pubSubInstance: any
): ModelDeclarationType<any> {
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
