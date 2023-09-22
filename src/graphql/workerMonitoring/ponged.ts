import { CustomSubscriptionConfiguration } from 'graphql-sequelize-generator/types'
import { GraphQLBoolean, GraphQLObjectType } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

const pongedType = new GraphQLObjectType({
  name: 'ponged',
  fields: {
    success: { type: GraphQLBoolean },
  },
})

export function ponged(
  pubSubInstance: PubSub
): CustomSubscriptionConfiguration {
  return {
    type: pongedType,
    description: 'Pong the server.',
    args: {},
    subscribe: () => pubSubInstance.asyncIterator('Ponged'),
  }
}
