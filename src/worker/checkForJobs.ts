import { Job, JSONValue } from '../types'
import uuidv4 from 'uuid'
import _debug from 'debug'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'node-fetch'

import updateProcessingInfo from './updateProcessingInfo'
import updateJobQuery from './updateJobQuery'

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

export default async function checkForJobs({
  processingFunction,
  uri,
  typeList,
  workerId = undefined,
  looping = true,
  loopTime = 1000
}: {
  processingFunction: (
    job: Job,
    facilities: { updateProcessingInfo: Function }
  ) => Promise<any>
  uri: string
  typeList: Array<String>
  workerId?: string
  looping: true
  loopTime?: number
}): Promise<any> {
  if (!typeList || typeList.length === 0) {
    throw new Error('Please provide a typeList property in the configuration.')
  }

  if (!workerId) {
    workerId = uuidv4()
  }

  const link = new HttpLink({
    uri,
    fetch: fetch as any
  })
  const cache = new InMemoryCache()
  debug(
    `Worker ${workerId}, checking for jobs of types :${typeList.join(', ')}.`
  )
  const client = new ApolloClient({
    link,
    cache
  })

  const { data } = await client.mutate({
    mutation: acquireJobQuery,
    variables: { typeList, workerId }
  })

  const { job } = data

  if (!job) {
    if (looping) {
      setTimeout(
        () =>
          checkForJobs({
            processingFunction,
            uri,
            typeList,
            workerId,
            looping,
            loopTime
          }),
        loopTime
      )
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
        updateProcessingInfo(client, job, info)
      }
    })
    debug("Job's done", job.id)
  } catch (err) {
    debug('Error during the job processing', err)
    await client.mutate({
      mutation: updateJobQuery,
      variables: {
        job: {
          id: job.id,
          status: 'failed',
          output: {
            error: `[${err.toString()}] Stack: ${
              err.stack ? err.stack.toString() : 'No stack available.'
            }`
          }
        }
      }
    })

    if (looping) {
      return checkForJobs({
        processingFunction,
        uri,
        typeList,
        workerId,
        looping,
        loopTime
      })
    }
    return err
  }

  debug('Updating job')

  try {
    const result = await client.mutate({
      mutation: updateJobQuery,
      variables: {
        job: {
          id: job.id,
          status: 'successful',
          output
        }
      }
    })

    if (looping) {
      return checkForJobs({
        processingFunction,
        uri,
        typeList,
        workerId,
        looping,
        loopTime
      })
    }
    return result.data.job
  } catch (err) {
    debug('Failed to update the success status of the current job.', err)
  }
}
