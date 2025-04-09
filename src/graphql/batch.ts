import {
  InAndOutTypes,
  ModelDeclarationType,
  SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/src/types/types'

export default function BatchConfiguration(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels
): ModelDeclarationType<any> {
  return {
    model: models.batch,
    actions: ['list', 'update', 'create', 'count'],
    list: {
      beforeList: ({ findOptions }) => {
        return findOptions
      },
    },
    create: {
      afterCreate: async ({ createdEntity: batch, source, args, context, info }) => {
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
