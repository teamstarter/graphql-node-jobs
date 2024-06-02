import { SequelizeModels } from '@teamstarter/graphql-sequelize-generator/src/types/types'

export function workerSuccessRating(models: SequelizeModels) {
  return {
    model: models.workerSuccessRating,
    actions: ['list', 'count'],
  }
}
