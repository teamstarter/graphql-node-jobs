import { GraphQLInt, GraphQLNonNull } from 'graphql'
import {
  CustomMutationConfiguration,
  InAndOutTypes,
  SequelizeModels,
} from 'graphql-sequelize-generator/types'

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

      if (job.status === 'queued') {
        throw new Error('The job must be failed.')
      }

      if (job.status === 'failed') {
        const attributesToDelete = ['id', 'createdAt', 'updateAt', 'status']

        const oldJobAttributes = Object.keys(job.dataValues).reduce(
          (acc: any, flag: any) => {
            if (!attributesToDelete.includes(flag)) {
              acc[flag] = job.dataValues[flag]
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
      }
    },
  }
}
