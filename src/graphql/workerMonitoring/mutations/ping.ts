import { GraphQLFieldConfig } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { successType } from '../type'

export function ping(pubSubInstance: PubSub): GraphQLFieldConfig<any, any, any> {
  return {
    type: successType,
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
