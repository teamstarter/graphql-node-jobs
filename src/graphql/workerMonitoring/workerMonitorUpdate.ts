import { CustomMutationConfiguration } from 'graphql-sequelize-generator/types'
import { GraphQLBoolean, GraphQLObjectType } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

const workerMonitorUpdateType = new GraphQLObjectType({
  name: 'workerMonitorUpdate',
  fields: {
    success: { type: GraphQLBoolean },
  },
})

export function workerMonitorUpdate(
  pubSubInstance: PubSub
): CustomMutationConfiguration {
  return {
    type: workerMonitorUpdateType,
    description: 'Update workers status',
    args: {},
    resolve: async () => {
      try {
        pubSubInstance.publish('WORKER_STATUS_CHANGED', {
          workerMonitoringUpdated: {
            workerType: 'api-heavy-worker',
            workerStatus: 'AVAILABLE',
          },
        })
        return { success: true }
      } catch (error) {
        console.error('Error during workers update', error)
        return { success: false }
      }
    },
  }
}
