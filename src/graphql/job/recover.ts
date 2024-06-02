import {
    CustomMutationConfiguration,
    InAndOutTypes,
    SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/src/types/types'
import { GraphQLInt, GraphQLNonNull } from 'graphql'

export default function recoverJobDefinition(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels
): CustomMutationConfiguration {
  return {
    type: graphqlTypes.outputTypes.job,
    description:
      'Recover a job by putting it back in the queue with the processing information already acquired',
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLInt),
      },
    },
    resolve: async (source, args, context) => {
      const job = await models.job.findByPk(args.id)

      if (!job) {
        throw new Error('The job does not exist')
      }

      if (!job.isRecoverable) {
        throw new Error('The job must be recoverable')
      }

      if (job.status !== 'failed') {
        throw new Error('The job must be failed')
      }

      await job.update({ status: 'queued' })

      return job
    },
  }
}
