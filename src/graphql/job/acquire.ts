import { GraphQLString, GraphQLNonNull, GraphQLList } from 'graphql'
import { CustomMutationConfiguration, InAndOutTypes, SequelizeModels } from 'graphql-sequelize-generator/types'
import { Op } from 'sequelize'


export default function AcquireJobDefinition(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels
): CustomMutationConfiguration {
  return {
    type: graphqlTypes.outputTypes.job,
    description:
      'Try to find a job of a given type and assign it to the given worker.',
    args: {
      typeList: {
        type: new GraphQLNonNull(GraphQLList(new GraphQLNonNull(GraphQLString)))
      },
      workerId: { type: GraphQLString }
    },
    resolve: async (source, args, context) => {
      const transaction = await models.sequelize.transaction()
      const job = await models.job.findOne({
        where: {
          type: args.typeList,
          status: 'queued',
          [Op.or]: [
            { startAfter: null },
            { startAfter: { [Op.lt]: new Date() } }
          ]
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
          status: 'processing',
          startedAt: new Date()
        },
        { transaction }
      )

      await transaction.commit()
      return job
    }
  }
}
