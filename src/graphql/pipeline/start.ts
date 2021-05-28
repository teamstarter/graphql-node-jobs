import { GraphQLInt, GraphQLNonNull } from 'graphql'
import {
  CustomMutationConfiguration,
  InAndOutTypes,
  SequelizeModels,
} from 'graphql-sequelize-generator/types'

import putNextStepJobsInTheQueued from '../utils/putNextStepJobsInTheQueued'

export default function StartPipeline(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels
): CustomMutationConfiguration {
  return {
    type: graphqlTypes.outputTypes.pipeline,
    description: 'Start a pipeline',
    args: {
      id: { type: new GraphQLNonNull(GraphQLInt) },
    },
    resolve: async (source, args, context) => {
      const pipelineId = args.id
      const pipeline = await models.pipeline.findByPk(pipelineId)

      if (!pipeline) {
        throw new Error('The pipeline does not exist')
      }

      if (pipeline.status !== 'planned') {
        throw new Error('The pipeline has already been started')
      }

      const step = await models.pipelineStep.findOne({
        where: { pipelineId, status: 'planned' },
        order: [['index', 'ASC']],
      })

      if (!step) {
        throw new Error('No steps related to this pipeline were found')
      }

      await pipeline.update({ status: 'processing' })

      await putNextStepJobsInTheQueued(step, models)

      return pipeline
    },
  }
}
