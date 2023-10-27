import { SequelizeModels } from '@teamstarter/graphql-sequelize-generator/types'

export function workerSuccessRating(models: SequelizeModels) {
  return {
    model: models.workerSuccessRating,
    actions: ['list', 'count'],
  }
}
