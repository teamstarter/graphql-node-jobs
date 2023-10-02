import { CustomSubscriptionConfiguration } from 'graphql-sequelize-generator/types'
import { GraphQLList } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { workerInfoOutputType } from '../type'

export function ponged(
  pubSubInstance: PubSub
): CustomSubscriptionConfiguration {
  return {
    type: new GraphQLList(workerInfoOutputType),
    description: 'Ponged the server.',
    args: {},
    subscribe: () => pubSubInstance.asyncIterator('Ponged'),
  }
}
