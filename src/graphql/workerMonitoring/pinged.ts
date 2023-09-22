import { CustomSubscriptionConfiguration } from 'graphql-sequelize-generator/types'
import { GraphQLBoolean, GraphQLObjectType } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

const pingedType = new GraphQLObjectType({
  name: 'pinged',
  fields: {
    success: { type: GraphQLBoolean },
  },
})

export function pinged(
  pubSubInstance: PubSub
): CustomSubscriptionConfiguration {
  return {
    type: pingedType,
    description: 'Ping the server.',
    args: {},
    subscribe: () => pubSubInstance.asyncIterator('Pinged'),
  }
}
