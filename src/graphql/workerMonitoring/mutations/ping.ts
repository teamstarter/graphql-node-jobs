import { CustomMutationConfiguration } from 'graphql-sequelize-generator/types'
import { PubSub } from 'graphql-subscriptions'
import { successType } from '../type'

export function ping(pubSubInstance: PubSub): CustomMutationConfiguration {
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
