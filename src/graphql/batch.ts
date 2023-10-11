import {
  ModelDeclarationType,
  SequelizeModels,
  InAndOutTypes,
} from '@teamstarter/graphql-sequelize-generator/types'

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
    create: {
      after: async (batch, source, args, context, info) => {
        if (batch.pipelineId) {
          const indexCount = await models.pipelineStep.count({
            where: {
              pipelineId: batch.pipelineId,
            },
          })

          await models.pipelineStep.create({
            batchId: batch.id,
            pipelineId: batch.pipelineId,
            index: indexCount + 1,
          })
        }

        return batch
      },
    },
  }
}
