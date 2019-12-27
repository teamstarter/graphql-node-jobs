import { GraphQLString, GraphQLNonNull } from 'graphql'
import {
  InAndOutGraphqlTypes,
  SequelizeModels,
  CustomMutationConfiguration
} from '../../types'

export default function AcquireJobDefinition(
  graphqlTypes: InAndOutGraphqlTypes,
  models: SequelizeModels
): CustomMutationConfiguration {
  return {
    type: graphqlTypes.outputTypes.job,
    description:
      'Try to find a job of a given type and assign it to the given worker.',
    args: {
      type: { type: new GraphQLNonNull(GraphQLString) },
      workerId: { type: GraphQLString }
    },
    resolve: async (source, args, context) => {
      const transaction = await models.sequelize.transaction()
      const job = await models.job.findOne({
        where: {
          type: args.type,
          status: 'queued'
        },
        order: [['id', 'ASC']],
        transaction
      })
      if (!job) {
        await transaction.commit()
        return null
      }

      await job.update(
        {
          workerId: args.workerId,
          status: 'processing'
        },
        { transaction }
      )

      await transaction.commit()
      return job
    }
  }
}
