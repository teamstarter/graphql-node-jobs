import fetch from 'node-fetch'
import {
  ApolloClient,
  createHttpLink,
  ApolloClientOptions,
} from '@apollo/client'
import { InMemoryCache } from '@apollo/client/cache'

type Partial<T> = {
  [P in keyof T]?: T[P]
}

export default function getNewClient(
  uri: string,
  apolloClientOptions: Partial<ApolloClientOptions<any>> = {}
) {
  const link = createHttpLink({
    uri,
    fetch: fetch as any,
  })
  const cache = new InMemoryCache()
  const client = new ApolloClient({
    ssrMode: true,
    link,
    cache,
    ...apolloClientOptions,
  })
  return client
}
