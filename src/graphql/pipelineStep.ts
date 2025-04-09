import {
  InAndOutTypes,
  ModelDeclarationType,
  SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/src/types/types'

export default function PipelineStepConfiguration(
  types: InAndOutTypes,
  models: SequelizeModels
): ModelDeclarationType<any> {
  return {
    model: models.pipelineStep,
    actions: ['list', 'update', 'create', 'count'],
    list: {
      beforeList: ({findOptions}) => {
        return findOptions
      },
    },
  }
}
