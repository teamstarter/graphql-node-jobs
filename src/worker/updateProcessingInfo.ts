import updateJobQuery from './updateJobQuery'
import ApolloClient from 'apollo-client'
import { Job, JSONValue } from './../types'
import { CancelRequestedError } from '../graphql/job'

export default async function updateProcessingInfo(
  client: ApolloClient<any>,
  job: Job,
  processingInfo: JSONValue,
  isCancelledOnCancelRequest?: boolean
) {
  const response = await client.mutate({
    mutation: updateJobQuery,
    variables: {
      job: {
        id: job.id,
        processingInfo,
      },
    },
  })
  if (
    isCancelledOnCancelRequest &&
    response.data.job.status === 'cancel-requested'
  ) {
    throw new CancelRequestedError('A job cancelation was requested !')
  } else {
    return response
  }
}
