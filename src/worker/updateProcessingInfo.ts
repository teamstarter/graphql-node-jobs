import { ApolloClient } from '@apollo/client/core'
import { CancelRequestedError } from '../graphql/job'
import { JobType, ProcessingInfo } from './../types'
import updateJobQuery from './updateJobQuery'

export default async function updateProcessingInfo(
  client: ApolloClient<any>,
  job: JobType,
  processingInfo: ProcessingInfo,
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
