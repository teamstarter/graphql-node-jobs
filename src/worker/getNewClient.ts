import fetch from 'node-fetch'
import { ApolloClient, ApolloClientOptions } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

type Partial<T> = {
  [P in keyof T]?: T[P]
}

export default function getNewClient(
  uri: string,
  apolloClientOptions: Partial<ApolloClientOptions<any>> = {}
) {
  const link = new HttpLink({
    uri,
    fetch: fetch as any,
  })
  const cache = new InMemoryCache()
  const client = new ApolloClient({
    link,
    cache,
    ...apolloClientOptions,
  })
  return client
}
