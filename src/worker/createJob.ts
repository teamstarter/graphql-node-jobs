import { Job } from '../types'
import _debug from 'debug'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'

const acquireJobQuery = gql`
  mutation jobCreate($job: jobInput!) {
    jobCreate(job: $job) {
      id
      name
      type
      status
      isUpdateAlreadyCalledWhileCancelRequested
      input
      output
      startAfter
      batchId
      createdAt
    }
  }
`

export default async function createJob(
  client: ApolloClient<any>,
  job: Job
): Promise<any> {
  if (!job) {
    throw new Error('Please provide a job to create.')
  }

  const { data, errors } = await client.mutate({
    mutation: acquireJobQuery,
    variables: { job },
  })

  if (errors) {
    throw new Error(errors[0].message)
  }

  return data.jobCreate
}
