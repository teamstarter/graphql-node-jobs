import {
  ModelDeclarationType,
  SequelizeModels,
  InAndOutTypes,
} from 'graphql-sequelize-generator/types'

export default function BatchConfiguration(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels
): ModelDeclarationType {
  return {
    model: models.batch,
    actions: ['list', 'update', 'create', 'count'],
    list: {
      before: (findOptions) => {
        return findOptions
      },
    },
  }
}
