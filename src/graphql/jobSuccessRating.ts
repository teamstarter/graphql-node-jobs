import { SequelizeModels } from '@teamstarter/graphql-sequelize-generator/types'

export function jobSuccessRating(models: SequelizeModels) {
  return {
    model: models.jobSuccessRating,
    actions: ['list', 'count'],
  }
}
