import {
    InAndOutTypes,
    ModelDeclarationType,
    SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/src/types/types'

import { GraphQLNonNull, GraphQLString } from 'graphql'

export default function jobHoldType(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels
): ModelDeclarationType<any> {
  return {
    model: models.jobHoldType,
    actions: ['list'],
    additionalMutations: {
      toggleHoldJobType: {
        type: graphqlTypes.outputTypes.jobHoldType,
        description: 'Allow to toggle hold job type',
        args: {
          type: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: async (source, args, context) => {
          const jobHoldType = await models.jobHoldType.findOne({
            where: { type: args.type },
          })

          if (!jobHoldType) {
            return await models.jobHoldType.create({
              type: args.type,
            })
          } else {
            await models.jobHoldType.destroy({
              where: { type: args.type },
            })
            return null
          }
        },
      },
    },
    list: {
      before: (findOptions) => {
        return findOptions
      },
    },
  }
}
