import { Job, JSONValue } from '../types'
import uuidv4 from 'uuid'
import _debug from 'debug'
import { ApolloClient } from '@apollo/client'
import gql from 'graphql-tag'

import updateProcessingInfo from './updateProcessingInfo'
import updateJobQuery from './updateJobQuery'
import { CancelRequestedError } from '../graphql/job'

const debug = _debug('graphql-node-jobs')

const loopTime = 1000

const acquireJobQuery = gql`
  mutation acquireJob($typeList: [String!]!, $workerId: String) {
    job: acquireJob(typeList: $typeList, workerId: $workerId) {
      id
      type
      name
      input
      output
    }
  }
`

export default async function checkForJobs(args: {
  processingFunction: (
    job: Job,
    facilities: { updateProcessingInfo: Function }
  ) => Promise<any>
  client: ApolloClient<any>
  typeList: Array<String>
  workerId?: string
  workerType: string
  looping: true
  loopTime?: number
  isCancelledOnCancelRequest?: boolean
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
    loopTime = 1000,
    isCancelledOnCancelRequest = false,
  } = args

  console.log(workerId)

  const { data } = await client.mutate({
    mutation: acquireJobQuery,
    variables: { typeList, workerId },
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

  debug('Reiceived a new job', job)
  let output = null
  try {
    output = await processingFunction(job, {
      updateProcessingInfo: (info: JSONValue) => {
        return updateProcessingInfo(
          client,
          job,
          info,
          isCancelledOnCancelRequest
        )
      },
    })
    debug("Job's done", job.id)
  } catch (err: any) {
    debug('Error during the job processing', err)
    let updatedErrorJob = null
    // @todo find why instanceof is not working
    if (err.name === 'CancelRequestedError') {
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

    if (looping) {
      return checkForJobs(args)
    }
    return updatedErrorJob.data.job
  }

  debug('Updating job')

  try {
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

    if (looping) {
      return checkForJobs(args)
    }
    return result.data.job
  } catch (err) {
    debug('Failed to update the success status of the current job.', err)
  }
}
