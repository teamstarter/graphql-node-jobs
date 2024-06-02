import {
  InAndOutTypes,
  ModelDeclarationType,
  SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/src/types/types'
import debounce from 'debounce'
import { PubSub } from 'graphql-subscriptions'

import { JobType } from '../types'
import putNextStepJobsInTheQueued from './utils/putNextStepJobsInTheQueued'
import updatePipelineStatus from './utils/updatePipelineStatus'

import { isAfter } from 'date-fns'
import acquireJob from './job/acquire'
import recoverJob from './job/recover'
import retryJob from './job/retry'

// You will throw a CancelRequestedError in your application to set the job status to 'cancelled'
export class CancelRequestedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CancelRequestedError'
  }
}

function getLastDoneStepDate(job: any) {
  // If there is not steps, we return the job start date.
  if (!job.processingInfo?.steps) {
    return job.startedAt
  }

  const steps = job.processingInfo.steps
  return Object.keys(steps as Object).reduce(
    (refDate: any, stepName: string) => {
      let stepContent = steps[stepName]

      if (!stepContent.doneAt) {
        return refDate
      }

      // If a step is older, we use the step value
      const jobDoneAt = new Date(stepContent.doneAt)
      if (jobDoneAt && isAfter(jobDoneAt, refDate)) {
        return jobDoneAt
      }

      return refDate
    },
    job.startedAt
  )
}

const allInstanceOfDebounceBatch: any = []

function getInstanceOfDebounceBatch(batchId: number) {
  const instance = allInstanceOfDebounceBatch.filter(
    (instance: any) => instance.batchId === batchId
  )

  if (!instance.length) {
    allInstanceOfDebounceBatch.push({
      batchId: batchId,
      debounce: debounce((callback: Function) => callback(), 50),
    })

    return allInstanceOfDebounceBatch.filter(
      (instance: any) => instance.batchId === batchId
    )[0].debounce
  }

  return instance[0].debounce
}

export default function JobConfiguration(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels,
  pubSubInstance: PubSub | null = null,
  onJobFail?: (job: JobType) => Promise<any>
): ModelDeclarationType<any> {
  return {
    model: models.job,
    actions: ['list', 'update', 'create', 'count'],
    subscriptions: ['create', 'update', 'delete'],
    additionalMutations: {
      acquireJob: acquireJob(graphqlTypes, models),
      recover: recoverJob(graphqlTypes, models),
      retryJob: retryJob(graphqlTypes, models, pubSubInstance),
    },
    list: {
      before: (findOptions) => {
        return findOptions
      },
    },
    update: {
      before: async (findOptions, args, context, info) => {
        const properties = args.job

        const job = await models.job.findByPk(args.job.id)
        if (!job) {
          throw new Error(`Could not find the job with the id [${job.id}]`)
        }

        // We set the end date when the status switch to a terminating state.
        // End date can be either a success or a failure.
        if (
          ['successful', 'cancelled', 'failed'].includes(args.job.status) &&
          args.job.status !== job.status
        ) {
          properties.endedAt = new Date()
        }

        if (
          job.status === 'cancel-requested' &&
          (!args.job.status || args.job.status === job.status)
        ) {
          if (job.isUpdateAlreadyCalledWhileCancelRequested) {
            properties.status = 'cancelled'
            properties.cancelledAt = new Date()
            throw new Error(
              'The job was requested to be cancelled at the previous call. Please check for the status "cancel-requested" after calling updateProcessingInfo in your worker and throw a CancelRequestedError'
            )
          } else {
            properties.isUpdateAlreadyCalledWhileCancelRequested = true
          }
        }

        // We set the start date when the status switch to processing.
        if ('processing' === args.job.status && job.status === 'queued') {
          properties.startedAt = new Date()
        }

        // We set the cancelled date when the status switches.
        if ('cancelled' === args.job.status && job.status !== args.job.status) {
          properties.cancelledAt = new Date()
        }

        // Queued job are instantly cancelled when requested to be cancelled.
        if (args.job.status === 'cancel-requested' && job.status === 'queued') {
          properties.status = 'cancelled'
        }

        let newSteps = null
        if (
          typeof args.job.processingInfo !== 'string' &&
          typeof args.job.processingInfo !== 'number' &&
          typeof args.job.processingInfo !== 'boolean' &&
          !Array.isArray(args.job.processingInfo) &&
          typeof args.job.processingInfo?.steps !== 'undefined' &&
          typeof args.job.processingInfo.steps !== null
        ) {
          const steps: any = args.job.processingInfo.steps
          let lastUpdatedDate = getLastDoneStepDate(job)
          newSteps = Object.keys(steps as Object).reduce(
            (acc: any, stepName: string) => {
              let newStepContent = steps[stepName]

              let previousStepContent = job.processingInfo &&
                job.processingInfo.steps ?
                job.processingInfo.steps[stepName] : null

              const isStepAlreadySavedAsDone =
                previousStepContent &&
                previousStepContent.doneAt

              // We set the end date when the status switch to a terminating state.
              if (newStepContent.status === 'done' && !isStepAlreadySavedAsDone) {
                const time = new Date()
                const prevTime = lastUpdatedDate
                newStepContent.doneAt = time
                newStepContent.elapsedTime = time.getTime() - prevTime.getTime()
              }

              // The previous step content contains informations that only the server might have
              // for exemple the doneAt and elapsedTime are maybe not taken in account by the client.
              // An accepted side effect is that it is impossible to remove an attribute from the processingInfo
              // through a client update. But it's way easier for users than have to sync the processingInfo themselves.
              acc[stepName] = { ...previousStepContent, ...newStepContent }

              return acc
            },
            {}
          )

          properties.processingInfo.steps = newSteps
        }
        return properties
      },
      after: async (job, oldJob) => {
        if (job.status === 'failed' && onJobFail) {
          await onJobFail(job)
        }

        if (
          (job.status === 'successful' || job.status === 'failed') &&
          job.batchId
        ) {
          const debounceBatch = getInstanceOfDebounceBatch(job.batchId)
          debounceBatch(async () => {
            const batch = await models.batch.findByPk(job.batchId)
            const jobs = await models.job.findAll({
              where: {
                batchId: job.batchId,
              },
            })
            const allJobsAreSuccessful = jobs.every(
              (job: any) => job.status === 'successful'
            )

            if (allJobsAreSuccessful) {
              await batch.update({
                status: 'successful',
              })

              const step = await models.pipelineStep.findOne({
                where: { batchId: batch.id },
              })

              if (step) {
                step.update({
                  status: 'done',
                })
              }

              const nextStep = await models.pipelineStep.findOne({
                where: {
                  pipelineId: batch.pipelineId,
                  status: 'planned',
                },
                order: [['index', 'ASC']],
              })

              if (nextStep) {
                await putNextStepJobsInTheQueued(nextStep, models)
              } else {
                await updatePipelineStatus(batch.pipelineId, models)
              }
            } else if (!allJobsAreSuccessful) {
              await batch.update({
                status: 'failed',
              })
            }
          })
        }

        if (
          (job.status === 'successful' || job.status === 'failed') &&
          job.pipelineId
        ) {
          const step = await models.pipelineStep.findOne({
            where: { jobId: job.id },
          })
          // When job of pipeline is successful we switch next job(s) status to queued
          if (step) {
            await step.update({
              status: 'done',
            })

            const nextStep = await models.pipelineStep.findOne({
              where: {
                pipelineId: step.pipelineId,
                status: 'planned',
              },
              order: [['index', 'ASC']],
            })

            if (nextStep) {
              await putNextStepJobsInTheQueued(nextStep, models)
            } else {
              // When the last step of a pipeline is finished then we update its status
              await updatePipelineStatus(step.pipelineId, models)
            }
          }
        }

        return job
      },
    },
    create: {
      before: async (findOptions, args, context, info) => {
        const properties = args.job

        if (
          (properties.pipelineId || properties.batchId) &&
          !properties.status
        ) {
          properties.status = 'planned'
        }

        return properties
      },
      after: async (job, source, args, context, info) => {
        if (job.pipelineId) {
          const pipeline = await models.pipeline.findByPk(job.pipelineId)

          if (!['successful', 'failed'].includes(pipeline.status)) {
            const indexCount = await models.pipelineStep.count({
              where: {
                pipelineId: job.pipelineId,
              },
            })

            await models.pipelineStep.create({
              jobId: job.id,
              pipelineId: job.pipelineId,
              index: indexCount + 1,
            })
          }
        }

        return job
      },
      preventDuplicateOnAttributes: ['jobUniqueId'],
    },
  }
}
