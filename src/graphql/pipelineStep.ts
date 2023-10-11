import {
  InAndOutTypes,
  ModelDeclarationType,
  SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/types'

export default function PipelineStepConfiguration(
  types: InAndOutTypes,
  models: SequelizeModels
): ModelDeclarationType {
  return {
    model: models.pipelineStep,
    actions: ['list', 'update', 'create', 'count'],
    list: {
      before: (findOptions) => {
        return findOptions
      },
    },
  }
}
