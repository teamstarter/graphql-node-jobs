import {
  InAndOutTypes,
  ModelDeclarationType,
  SequelizeModels,
} from 'graphql-sequelize-generator/types'

import startPipeline from './pipeline/start'

export default function PipelineConfiguration(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels
): ModelDeclarationType {
  return {
    model: models.pipeline,
    actions: ['list', 'update', 'create', 'count'],
    additionalMutations: {
      startPipeline: startPipeline(graphqlTypes, models),
    },
    list: {
      before: (findOptions) => {
        return findOptions
      },
    },
  }
}
