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
  let newProcessingInfo = null
  if (
    typeof processingInfo !== 'string' &&
    typeof processingInfo !== 'number' &&
    typeof processingInfo !== 'boolean' &&
    !Array.isArray(processingInfo) &&
    typeof processingInfo?.steps !== 'undefined' &&
    typeof processingInfo.steps !== null
  ) {
    const steps: any = processingInfo.steps
    newProcessingInfo = Object.keys(steps as Object).reduce(
      (acc: any, stepName: string) => {
        const newStep = steps[stepName]

        if (newStep.status === 'done' && newStep?.doneAt === undefined) {
          const time = new Date()
          const prevTime = new Date(job.updatedAt)
          newStep.test = job.updatedAt ? job.updatedAt : 'ca marche pas'
          newStep.doneAt = time
          newStep.elapsedTime = time.getTime() - prevTime.getTime()
        }

        acc[stepName] = newStep
        return acc
      },
      {}
    )
  }

  const response = await client.mutate({
    mutation: updateJobQuery,
    variables: {
      job: {
        id: job.id,
        processingInfo: newProcessingInfo ? newProcessingInfo : processingInfo,
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
