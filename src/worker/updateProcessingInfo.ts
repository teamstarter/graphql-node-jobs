import updateJobQuery from './updateJobQuery'
import ApolloClient from 'apollo-client'
import { Job, JSONValue } from './../types'

export default function updateProcessingInfo(
  client: ApolloClient<any>,
  job: Job,
  processingInfo: JSONValue
) {
  return client.mutate({
    mutation: updateJobQuery,
    variables: {
      job: {
        id: job.id,
        processingInfo
      }
    }
  })
}
