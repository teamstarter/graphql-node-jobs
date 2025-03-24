import {
  InAndOutTypes,
  ModelDeclarationType,
  SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/src/types/types'

import startPipeline from './pipeline/start'

export default function PipelineConfiguration(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels
): ModelDeclarationType<any> {
  return {
    model: models.pipeline,
    actions: ['list', 'update', 'create', 'count'],
    additionalMutations: {
      startPipeline: startPipeline(graphqlTypes, models),
    },
    list: {
      before: ({findOptions}) => {
        return findOptions
      },
    },
  }
}
