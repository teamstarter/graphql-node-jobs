import fetch from 'node-fetch'
import {
  ApolloClient,
  createHttpLink,
  ApolloClientOptions,
  split,
} from '@apollo/client'
import { InMemoryCache } from '@apollo/client/cache'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from 'apollo-utilities'
import WebSocket from 'ws'

type Partial<T> = {
  [P in keyof T]?: T[P]
}

export default function getNewClient(
  uri: string,
  wsUri: string,
  apolloClientOptions: Partial<ApolloClientOptions<any>> = {}
) {
  const httpLink = createHttpLink({
    uri,
    fetch: fetch as any,
  })
  const cache = new InMemoryCache()

  if (typeof wsUri === 'undefined') {
    return new ApolloClient({
      ssrMode: true,
      link: httpLink,
      cache,
      ...apolloClientOptions,
    })
  }

  const wsLink = new GraphQLWsLink(
    createClient({
      url:
        typeof wsUri !== 'undefined'
          ? wsUri
          : uri.replace('http', 'ws').replace('3000', '8080'),
      webSocketImpl: WebSocket,
    })
  )

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    httpLink
  )

  return new ApolloClient({
    ssrMode: true,
    link,
    cache,
    ...apolloClientOptions,
  })
}
