import { CustomSubscriptionConfiguration } from 'graphql-sequelize-generator/types'
import { GraphQLObjectType, GraphQLString } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

const workerInfoType = new GraphQLObjectType({
  name: 'workerInfo',
  fields: {
    workerType: { type: GraphQLString },
    workerStatus: { type: GraphQLString },
  },
})

export function workerMonitoringUpdated(
  pubSubInstance: PubSub
): CustomSubscriptionConfiguration {
  return {
    type: workerInfoType,
    description: 'Worker monitoring updated.',
    args: {},
    subscribe: async () =>
      pubSubInstance.asyncIterator('WORKER_STATUS_CHANGED'),
  }
}
