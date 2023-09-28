import {
  CustomMutationConfiguration,
  SequelizeModels,
} from 'graphql-sequelize-generator/types'
import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLString,
} from 'graphql'
import { PubSub } from 'graphql-subscriptions'

export const workerInfoInputType = new GraphQLInputObjectType({
  name: 'workerInfoInput',
  fields: {
    workerId: { type: GraphQLString },
    workerType: { type: GraphQLString },
    workerStatus: { type: GraphQLString },
  },
})

const workerMonitorUpdateType = new GraphQLObjectType({
  name: 'workerMonitorUpdate',
  fields: {
    success: { type: GraphQLBoolean },
  },
})

export function workerMonitorUpdate(
  pubSubInstance: PubSub,
  models: SequelizeModels
): CustomMutationConfiguration {
  return {
    type: workerMonitorUpdateType,
    description: 'Update workers status',
    args: {
      workers: { type: new GraphQLList(workerInfoInputType) },
    },
    resolve: async (_parent, args) => {
      try {
        const workers = args.workers

        args.workers.map(async (worker: any) => {
          await models.workerMonitoring.create({
            workerId: worker.workerId,
            workerType: worker.workerType,
            workerStatus: worker.workerStatus,
          })
        })
        pubSubInstance.publish('WORKER_STATUS_CHANGED', {
          workerMonitoringUpdated: workers,
        })
        return { success: true }
      } catch (error) {
        console.error('Error during workers update', error)
        return { success: false }
      }
    },
  }
}
