import {
  CustomMutationConfiguration,
  SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/types'
import { GraphQLList } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { successType, workerInfoInputType } from '../type'

export function workerMonitorUpdate(
  pubSubInstance: PubSub,
  models: SequelizeModels
): CustomMutationConfiguration {
  return {
    type: successType,
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
