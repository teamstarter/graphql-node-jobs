import { CustomSubscriptionConfiguration } from '@teamstarter/graphql-sequelize-generator/types'
import { GraphQLList } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { workerInfoOutputType } from '../type'

export function workerMonitorUpdated(
  pubSubInstance: PubSub
): CustomSubscriptionConfiguration {
  return {
    type: new GraphQLList(workerInfoOutputType),
    description: 'Worker monitor updated.',
    args: {},
    subscribe: async () =>
      pubSubInstance.asyncIterator('WORKER_STATUS_CHANGED'),
  }
}
