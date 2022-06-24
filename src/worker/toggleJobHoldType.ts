import { Job } from '../types'
import _debug from 'debug'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'

const toggleHoldJobTypeMutation = gql`
  mutation toggleHoldJobType($type: String!) {
    toggleHoldJobType(type: $type) {
      id
      type
    }
  }
`

export default async function toggleHoldJobType(
  client: ApolloClient<any>,
  type: string
): Promise<any> {
  if (!type) {
    throw new Error('Please provide a type to toggle.')
  }

  const { data, errors } = await client.mutate({
    mutation: toggleHoldJobTypeMutation,
    variables: { type },
  })

  if (errors) {
    throw new Error(errors[0].message)
  }

  return data.toggleHoldJobType
}
