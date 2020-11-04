import { InAndOutTypes, ModelDeclarationType, SequelizeModels } from 'graphql-sequelize-generator/types'


export default function PipelineConfiguration(
  types: InAndOutTypes,
  models: SequelizeModels
): ModelDeclarationType {
  return {
    model: models.pipeline,
    actions: ['list', 'update', 'create', 'count'],
    list: {
      before: findOptions => {
        return findOptions
      }
    }
  }
}
