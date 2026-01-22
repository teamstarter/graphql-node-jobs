import { ApolloClient } from '@apollo/client/core'

import gql from 'graphql-tag'

import { JSONValue } from '../types'

const listJobHoldTypeQuery = gql`
  query listJobHoldTypes(
    $where: SequelizeJSON
    $order: String
    $limit: Int
    $offset: Int
  ) {
    jobHoldTypes: jobHoldType(
      where: $where
      order: $order
      limit: $limit
      offset: $offset
    ) {
      id
      type
      createdAt
      updatedAt
    }
  }
`

export default async function listJobHoldTypes(
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
    query: listJobHoldTypeQuery,
    variables,
  })

  if (response.errors) {
    throw new Error(response.errors[0].message)
  }

  return response.data.jobHoldTypes
}
