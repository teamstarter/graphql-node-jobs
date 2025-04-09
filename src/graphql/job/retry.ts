import {
  InAndOutTypes,
  SequelizeModels
} from '@teamstarter/graphql-sequelize-generator/src/types/types'
import { GraphQLFieldConfig, GraphQLInt, GraphQLNonNull } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

const status = [
  'planned',
  'queued',
  'processing',
  'successful',
  'cancel-requested',
  'cancelled',
]

export default function RetryJob(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels,
  pubSubInstance: PubSub | null = null
): GraphQLFieldConfig<any, any, any> {
  return {
    type: graphqlTypes.outputTypes.job,
    description: 'Retry a job which fail',
    args: {
      id: { type: new GraphQLNonNull(GraphQLInt) },
    },
    resolve: async (source, args, context) => {
      const job = await models.job.findByPk(args.id)

      if (!job) {
        throw new Error('The job does not exist.')
      }

      if (job.status !== 'failed' && job.status !== 'cancelled') {
        throw new Error('The job must be failed or cancelled.')
      }

      // Attributes related to the run of a job should not be passed.
      const attributesToDelete = [
        'id',
        'createdAt',
        'updateAt',
        'status',
        'startedAt',
        'failedAt',
        'isUpdateAlreadyCalledWhileCancelRequested',
        'workerId',
        'endedAt',
        'deletedAt',
        'cancelledAt',
      ]

      const oldJobAttributes = Object.keys(job.dataValues).reduce(
        (acc: any, attribute: any) => {
          if (!attributesToDelete.includes(attribute)) {
            if (attribute === 'output' && job.status !== 'cancelled') {
              // We do not keep errors raised by a worker.
              if (job.dataValues[attribute].error) {
                const { otherAttributes, ...error } = job.dataValues[attribute]
                acc[attribute] = otherAttributes
                return acc
              }
            }
            acc[attribute] = job.dataValues[attribute]
          }

          return acc
        },
        {}
      )

      const attributes = {
        ...oldJobAttributes,
        retryOfJobId: job.id,
      }

      const newJob = await models.job.create(attributes)

      if (pubSubInstance) {
        pubSubInstance.publish(`jobCreated`, {
          [`jobCreated`]: newJob.get(),
        })
      }

      return newJob
    },
  }
}
