import {
  CustomMutationConfiguration,
  InAndOutTypes,
  SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/src/types/types'
import { GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql'
import { Op, Transaction } from 'sequelize'

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
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(GraphQLString))
        ),
      },
      workerId: { type: GraphQLString },
      workerType: { type: GraphQLString },
    },
    resolve: async (source, args, context) => {
      console.log('123debug')
      const transaction = await models.sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
      })
      const allJobHoldType = await models.jobHoldType.findAll({ transaction })
      const heldTypes = allJobHoldType.map((heldType: any) => heldType.type)

      if (heldTypes.includes('all')) {
        await transaction.rollback()
        return null
      }

      const conditions: any = [
        {
          type: args.typeList,
          status: 'queued',
          [Op.or]: [
            { startAfter: null },
            { startAfter: { [Op.lt]: new Date() } },
          ],
        },
      ]

      if (heldTypes && heldTypes.length && heldTypes.length > 0) {
        conditions.push({
          type: { [Op.notIn]: heldTypes },
        })
      }

      const job = await models.job.findOne({
        where: {
          [Op.and]: conditions,
        },
        order: [['id', 'ASC']],
        transaction,
      })

      if (!job) {
        await transaction.rollback()
        return null
      }

      await job.update(
        {
          workerId: args.workerId,
          status: 'processing',
          startedAt: new Date(),
        },
        { transaction }
      )

      await transaction.commit()

      return job
    },
  }
}
