import { GraphQLFieldConfig, GraphQLList } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { successType, workerInfoInputType } from '../type'

export function pong(pubSubInstance: PubSub): GraphQLFieldConfig<any, any, any> {
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
