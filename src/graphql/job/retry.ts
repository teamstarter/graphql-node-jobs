import { GraphQLInt, GraphQLNonNull } from 'graphql'
import {
  CustomMutationConfiguration,
  InAndOutTypes,
  SequelizeModels,
} from 'graphql-sequelize-generator/types'

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
  models: SequelizeModels
): CustomMutationConfiguration {
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

      if (job.status !== 'failed') {
        throw new Error('The job must be failed.')
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
            if (attribute === 'output') {
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

      return newJob
    },
  }
}
