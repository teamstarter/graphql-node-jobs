import { ApolloClient } from '@apollo/client/core'

import gql from 'graphql-tag'

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

export default async function listJobs(
  client: ApolloClient<any>,
  {
    where,
    order,
    limit,
    offset,
  }: {
    where?: JSONValue
    order?: string
    limit?: number
    offset?: number
  } = {}
) {
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

  const response = await client.query({
    query: listJobQuery,
    variables,
  })

  if (response.errors) {
    throw new Error(response.errors[0].message)
  }

  return response.data.jobs
}
