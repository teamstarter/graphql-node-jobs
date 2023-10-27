import { CustomMutationConfiguration } from '@teamstarter/graphql-sequelize-generator/types'
import { PubSub } from 'graphql-subscriptions'
import { GraphQLList } from 'graphql'
import { successType, workerInfoInputType } from '../type'

export function pong(pubSubInstance: PubSub): CustomMutationConfiguration {
  return {
    type: successType,
    description: 'Pong the server.',
    args: {
      workerInfoInput: { type: new GraphQLList(workerInfoInputType) },
    },
    resolve: async (_parent, args) => {
      try {
        pubSubInstance.publish('Ponged', {
          ponged: args.workerInfoInput,
        })
        return { success: true }
      } catch (error) {
        console.error('Une erreur est survenue lors du ping:', error)
        return { success: false }
      }
    },
  }
}
