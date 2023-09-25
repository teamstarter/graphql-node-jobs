import { CustomMutationConfiguration } from 'graphql-sequelize-generator/types'
import { GraphQLBoolean, GraphQLObjectType } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

const pingType = new GraphQLObjectType({
  name: 'ping',
  fields: {
    success: { type: GraphQLBoolean },
  },
})

export function ping(pubSubInstance: PubSub): CustomMutationConfiguration {
  return {
    type: pingType,
    description: 'Ping the server.',
    args: {},
    resolve: async () => {
      try {
        pubSubInstance.publish('Pinged', { success: true })
        return { success: true }
      } catch (error) {
        console.error('Une erreur est survenue lors du ping:', error)
        return { success: false }
      }
    },
  }
}
