import {
  InAndOutTypes,
  ModelDeclarationType,
  SequelizeModels,
} from 'graphql-sequelize-generator/types'

export default function WorkerMonitoringConfiguration(
  types: InAndOutTypes,
  models: SequelizeModels
): ModelDeclarationType {
  return {
    model: models.workerMonitoring,
    actions: ['list'],
    list: {
      before: (findOptions) => {
        return findOptions
      },
    },
  }
}
