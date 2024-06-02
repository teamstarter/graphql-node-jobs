import { SequelizeModels } from '@teamstarter/graphql-sequelize-generator/src/types/types'

export function jobSuccessRating(models: SequelizeModels) {
  return {
    model: models.jobSuccessRating,
    actions: ['list', 'count'],
  }
}
