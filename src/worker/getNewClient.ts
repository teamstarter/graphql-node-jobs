import fetch from 'node-fetch'
import {
  ApolloClient,
  createHttpLink,
  ApolloClientOptions,
  split,
  InMemoryCache,
} from '@apollo/client/core'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from 'apollo-utilities'
import WebSocket from 'ws'

type Partial<T> = {
  [P in keyof T]?: T[P]
}

global.WebSocket = WebSocket as any

export default function getNewClient(
  uri: string,
  wsUri: string,
  apolloClientOptions: Partial<ApolloClientOptions<any>> = {}
) {
  const httpLink = createHttpLink({
    uri,
    fetch: fetch as any,
    fetchOptions: {
      timeout: 300000, // 5 minutes timeout pour les gros payloads
    },
  })
  const cache = new InMemoryCache()
  let client: ApolloClient<any>

  if (typeof wsUri === 'undefined') {
    client = new ApolloClient({
      ssrMode: true,
      link: httpLink,
      cache,
      ...apolloClientOptions,
    })
    return client
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

  client = new ApolloClient({
    ssrMode: true,
    link,
    cache,
    ...apolloClientOptions,
  })

  return client
}
