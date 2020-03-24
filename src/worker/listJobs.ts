import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import fetch from 'node-fetch'

import { JSONValue } from '../types'

const listJobQuery = gql`
  query listJobs(
    $where: SequelizeJSON
    $order: String
    $limit: Int
    $offset: Int
  ) {
    jobs: job(where: $where, order: $order, limit: $limit, offset: $offset) {
      id
      type
      name
      input
      output
    }
  }
`

export default function listJobs(
  uri: string,
  {
    where,
    order,
    limit,
    offset
  }: {
    where?: JSONValue
    order?: string
    limit?: number
    offset?: number
  } = {}
) {
  const link = new HttpLink({
    uri,
    fetch: fetch as any
  })
  const cache = new InMemoryCache()
  const client = new ApolloClient({
    link,
    cache
  })

  const variables: any = {}

  if (where) {
    variables.where = where
  }

  if (order) {
    variables.order = order
  }

  if (limit) {
    variables.limit = limit
  }

  if (offset) {
    variables.offset = offset
  }

  return client.query({
    query: listJobQuery,
    variables
  })
}
