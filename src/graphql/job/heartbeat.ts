import {
  InAndOutTypes,
  SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/src/types/types'
import {
  GraphQLFieldConfig,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'
import { Op } from 'sequelize'

// The statuses in which a worker is still running the job.
const RUNNING_STATUSES = ['processing', 'cancel-requested']

export default function HeartbeatJobDefinition(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels,
): GraphQLFieldConfig<any, any, any> {
  return {
    type: graphqlTypes.outputTypes.job,
    description:
      'Record that the worker running the job is alive (job.heartbeatAt). Returns the job, or null when the job is no longer running, or is run by another worker than workerId.',
    args: {
      id: { type: new GraphQLNonNull(GraphQLInt) },
      workerId: { type: GraphQLString },
    },
    resolve: async (source, args) => {
      const where: any = {
        id: args.id,
        status: { [Op.in]: RUNNING_STATUSES },
      }
      if (args.workerId) {
        where.workerId = args.workerId
      }

      // `silent`: a heartbeat is not a change of the job, updatedAt stays the
      // date of the last real update.
      const [updatedCount] = await models.job.update(
        { heartbeatAt: new Date() },
        { where, silent: true },
      )

      if (updatedCount === 0) {
        return null
      }

      return models.job.findByPk(args.id)
    },
  }
}
