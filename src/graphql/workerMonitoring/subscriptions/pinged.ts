import { CustomSubscriptionConfiguration } from '@teamstarter/graphql-sequelize-generator/types'
import { PubSub } from 'graphql-subscriptions'
import { successType } from '../type'

export function pinged(
  pubSubInstance: PubSub
): CustomSubscriptionConfiguration {
  return {
    type: successType,
    description: 'Pinged the server.',
    args: {},
    subscribe: () => pubSubInstance.asyncIterator('Pinged'),
  }
}
