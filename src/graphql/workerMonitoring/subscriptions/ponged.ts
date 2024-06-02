import { CustomSubscriptionConfiguration } from '@teamstarter/graphql-sequelize-generator/src/types/types'
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
