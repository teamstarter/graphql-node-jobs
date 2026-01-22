import { ApolloClient } from '@apollo/client/core'
import _debug from 'debug'
import gql from 'graphql-tag'
import uuidv4 from 'uuid'
import { parentPort } from 'worker_threads'
import { JobType, ProcessingInfo, UpdateProcessingInfo } from '../types'

import updateJobQuery from './updateJobQuery'
import updateProcessingInfo from './updateProcessingInfo'

const debug = _debug('graphql-node-jobs')

const DEFAULT_LOOP_TIME = 1000

const acquireJobQuery = gql`
  mutation acquireJob(
    $typeList: [String!]!
    $workerId: String
    $workerType: String
  ) {
    job: acquireJob(
      typeList: $typeList
      workerId: $workerId
      workerType: $workerType
    ) {
      id
      type
      name
      input
      output
      status
    }
  }
`

async function handleJobResult({ client, job, output, looping, args }: any) {
  debug('Updating job after successful processing.')

  try {
    // Temporary fix for https://github.com/node-fetch/node-fetch/issues/1735
    // See also: https://github.com/anthropics/anthropic-sdk-typescript/issues/712
    // Should be removed when we can switch to node23. Sadly beanstalk has no support for it yet.
    await new Promise((resolve) => setTimeout(resolve, 0))

    const result = await client.mutate({
      mutation: updateJobQuery,
      variables: {
        job: {
          id: job.id,
          status: 'successful',
          output,
        },
      },
    })

    parentPort?.postMessage({ status: 'AVAILABLE' })
    if (looping) {
      return checkForJobs(args)
    }
    return result.data.job
  } catch (err) {
    debug('Failed to update the success status of the current job.', err)
    return handleError({ err, client, job, looping, args })
    //parentPort?.postMessage({ status: 'FAILED' })
  }
}

async function handleError({
  err,
  client,
  job,
  looping,
  args,
}: {
  err: any
  client: ApolloClient<any>
  job: JobType
  looping: boolean
  args: any
}) {
  debug('Error during the job processing', err)
  let updatedErrorJob = null
  // @todo find why instanceof is not working
  if (err.name === 'CancelRequestedError') {
    await new Promise((resolve) => setTimeout(resolve, 0))

    updatedErrorJob = await client.mutate({
      mutation: updateJobQuery,
      variables: {
        job: {
          id: job.id,
          status: 'cancelled',
          output: {
            cancelMessage: err.message || 'No cancel message provided',
          },
        },
      },
    })
  } else {
    await new Promise((resolve) => setTimeout(resolve, 0))

    updatedErrorJob = await client.mutate({
      mutation: updateJobQuery,
      variables: {
        job: {
          id: job.id,
          status: 'failed',
          output: {
            error: `[${err.toString()}] Stack: ${
              err.stack ? err.stack.toString() : 'No stack available.'
            }`,
          },
        },
      },
    })
  }

  parentPort?.postMessage({ status: 'AVAILABLE' })
  if (looping) {
    return checkForJobs(args)
  }
  return updatedErrorJob.data.job
}

export default async function checkForJobs(args: {
  processingFunction: (
    job: JobType,
    facilities: { updateProcessingInfo: UpdateProcessingInfo }
  ) => Promise<any>
  client: ApolloClient<any>
  typeList: Array<String>
  workerId?: string
  workerType: string
  looping: true
  loopTime?: number
  isCancelledOnCancelRequest?: boolean
  nonBlocking?: boolean
}): Promise<any> {
  if (!args.typeList || args.typeList.length === 0) {
    throw new Error('Please provide a typeList property in the configuration.')
  }

  if (!args.workerId) {
    args.workerId = uuidv4()
  }

  let {
    processingFunction,
    client,
    typeList,
    workerId = undefined,
    workerType,
    looping = true,
    loopTime = DEFAULT_LOOP_TIME,
    isCancelledOnCancelRequest = false,
    nonBlocking = false,
  } = args

  const { data } = await client.mutate({
    mutation: acquireJobQuery,
    variables: { typeList, workerId, workerType },
  })

  const { job } = data

  if (!job) {
    if (looping) {
      setTimeout(() => checkForJobs(args), loopTime)
      return null
    } else {
      return null
    }
  }

  parentPort?.postMessage({ status: 'PROCESSING' })
  debug('Reiceived a new job', job)
  let output = null
  try {
    const processingPromise = processingFunction(job, {
      updateProcessingInfo: async (info: ProcessingInfo) => {
        await updateProcessingInfo(
          client,
          job,
          info,
          isCancelledOnCancelRequest
        )
      },
    })

    if (nonBlocking) {
      processingPromise
        .then((output) => {
          debug("Job's done", job.id)
          // We only save the result, the looping will be instantly started
          handleJobResult({ client, job, output, looping: false, args })
        })
        .catch((err) => {
          handleError({ err, client, job, looping, args })
        })
      if (looping) {
        return checkForJobs(args)
      }
    } else {
      output = await processingPromise
      debug("Job's done", job.id)
      return await handleJobResult({ client, job, output, looping, args })
    }
  } catch (err: any) {
    return handleError({ err, client, job, looping, args })
  }

  // In the case the looping is not enabled and the async processing is not enabled
  // we return the "processing" job.
  return job
}
