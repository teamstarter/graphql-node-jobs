import {
  InAndOutTypes,
  ModelDeclarationType,
  SequelizeModels,
} from 'graphql-sequelize-generator/types'
import { pinged } from './workerMonitoring/pinged'
import { ponged } from './workerMonitoring/ponged'

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
    additionalSubscriptions: {
      pinged: pinged(pubSubInstance),
      ponged: ponged(pubSubInstance),
    },
  }
}
