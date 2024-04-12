import { ApolloClient } from '@apollo/client'
import gql from 'graphql-tag'
import { JobType } from '../types'

const acquireJobQuery = gql`
  mutation jobCreate($job: jobInput!) {
    jobCreate(job: $job) {
      id
      name
      type
      status
      isHighFrequency
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
  job: JobType
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
