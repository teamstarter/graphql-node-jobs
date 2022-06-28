import { GraphQLString, GraphQLNonNull, GraphQLList } from 'graphql'
import {
  CustomMutationConfiguration,
  InAndOutTypes,
  SequelizeModels,
} from 'graphql-sequelize-generator/types'
import { Op } from 'sequelize'
import debounce from 'debounce'

const allInstanceOfDebounceWorker: any = []

function getInstanceOfDebounceWorker(workerId: number) {
  const instance = allInstanceOfDebounceWorker.filter(
    (instance: any) => instance.workerId === workerId
  )

  if (!instance.length) {
    allInstanceOfDebounceWorker.push({
      workerId: workerId,
      debounce: debounce((callback: Function) => callback(), 50),
    })

    return process.env.NO_ASYNC === 'true'
      ? async (callback: Function) => callback()
      : allInstanceOfDebounceWorker.filter(
          (instance: any) => instance.workerId === workerId
        )[0].debounce
  }

  return process.env.NO_ASYNC === 'true'
    ? async (callback: Function) => callback()
    : instance[0].debounce
}

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
          GraphQLList(new GraphQLNonNull(GraphQLString))
        ),
      },
      workerId: { type: GraphQLString },
    },
    resolve: async (source, args, context) => {
      const transaction = await models.sequelize.transaction()
      const allJobHoldType = await models.jobHoldType.findAll({ transaction })
      const heldTypes = allJobHoldType.map((heldType) => heldType.type)

      if (heldTypes.includes('all')) {
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
        await transaction.commit()
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

      if (args.workerId) {
        const debounceWorker = getInstanceOfDebounceWorker(args.workerId)
        await debounceWorker(async () => {
          const workerMonitoring = await models.workerMonitoring.findOne({
            where: { workerId: args.workerId },
          })

          if (workerMonitoring) {
            await workerMonitoring.update({
              lastCalledAt: new Date(),
            })
          } else {
            await models.workerMonitoring.create({
              workerId: args.workerId,
              lastCalledAt: new Date(),
            })
          }
        })
      }

      return job
    },
  }
}
