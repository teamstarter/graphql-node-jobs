import { Job } from '../types'
import uuidv4 from 'uuid'
import _debug from 'debug'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'unfetch'

const debug = _debug('graphql-node-jobs')

const loopTime = 1000

const acquireJobQuery = gql`
  mutation acquireJob($type: String!, $workerId: String) {
    job: acquireJob(type: $type, workerId: $workerId) {
      id
      type
      name
      input
      output
    }
  }
`

const updateJobQuery = gql`
  mutation jobUpdate($job: jobInput!) {
    job: jobUpdate(job: $job) {
      id
      type
      name
      input
      output
      status
    }
  }
`

export default async function checkForJobs({
  processingFunction,
  uri,
  type,
  workerId = undefined,
  looping = true
}: {
  processingFunction: (job: Job) => Promise<any>
  uri: string
  type: string | Array<String>
  workerId?: string
  looping: true
}): Promise<any> {
  if (!workerId) {
    workerId = uuidv4()
  }

  const link = new HttpLink({
    uri,
    fetch
  })
  const cache = new InMemoryCache()
  debug(`Started worker ${workerId} in charge of types :${type}.`)
  const client = new ApolloClient({
    link,
    cache
  })

  const { data } = await client.mutate({
    mutation: acquireJobQuery,
    variables: { type, workerId }
  })

  const { job } = data

  if (!job) {
    if (looping) {
      setTimeout(checkForJobs, loopTime)
      return null
    } else {
      return null
    }
  }

  debug('Reiceived a new job', job)
  let output = null
  try {
    output = await processingFunction(job)
    debug("Job's done", job.id)
  } catch (err) {
    debug('Error during the job processing', err)
    // @todo update job status.
  }

  debug('Updating job')

  try {
    const result = await client.mutate({
      mutation: updateJobQuery,
      variables: {
        job: {
          id: job.id,
          status: 'successful',
          output: JSON.stringify(output)
        }
      }
    })

    if (looping) {
      return checkForJobs({ processingFunction, uri, type, workerId, looping })
    }
    return result
  } catch (err) {
    debug('Failed to update the success status of the current job.', err)
  }
}
