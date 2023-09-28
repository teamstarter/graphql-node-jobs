import { CustomSubscriptionConfiguration } from 'graphql-sequelize-generator/types'
import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

export const workerInfoType = new GraphQLObjectType({
  name: 'workerInfo',
  fields: {
    workerType: { type: GraphQLString },
    workerStatus: { type: GraphQLString },
  },
})

export function workerMonitorUpdated(
  pubSubInstance: PubSub
): CustomSubscriptionConfiguration {
  return {
    type: new GraphQLList(workerInfoType),
    description: 'Worker monitor updated.',
    args: {},
    subscribe: async () =>
      pubSubInstance.asyncIterator('WORKER_STATUS_CHANGED'),
  }
}
