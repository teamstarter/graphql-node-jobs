import {
  InAndOutTypes,
  SequelizeModels
} from '@teamstarter/graphql-sequelize-generator/src/types/types'
import {
  GraphQLFieldConfig,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'

interface AcquireJobArgs {
  typeList: string[]
  workerId?: string
}

export default function AcquireJobDefinition(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels
): GraphQLFieldConfig<any, any, any> {
  return {
    type: graphqlTypes.outputTypes.job,
    description:
      'Try to find a job of a given type and assign it to the given worker.',
    args: {
      typeList: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(GraphQLString))
        ),
      },
      workerId: { type: GraphQLString },
      workerType: { type: GraphQLString },
    },
    resolve: async (source: any, args: any, context: any) => {
      return acquireJob(models, args)
    },
  }
}
async function acquireJob(
  models: SequelizeModels,
  args: AcquireJobArgs
): Promise<any> {
  try {
    const heldTypes = (
      await models.jobHoldType.findAll({
        attributes: ['type'],
      })
    ).map((heldType: any) => heldType.type)

    // Check if 'all' is held
    if (heldTypes.includes('all')) {
      return null
    }
    const result = await models.sequelize.query(
      `
      UPDATE job
      SET "workerId" = ${args.workerId ? ':workerId' : 'NULL'},
          "status" = 'processing',
          "startedAt" = CURRENT_TIMESTAMP
      FROM (
        SELECT id
        FROM job
        WHERE type IN(:typeList)
          AND "status" = 'queued'
          AND (job."startAfter" IS NULL OR 
            job."startAfter" <= current_timestamp)
          AND type NOT IN (
            SELECT type
            FROM "jobHoldType" WHERE "deletedAt" IS NULL
          )
          AND job."deletedAt" IS NULL
        ORDER BY id ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      ) as subquery
      WHERE job.id = subquery.id
      RETURNING *;
      `,
      {
        replacements: {
          ...(args.workerId ? { workerId: args.workerId } : {}),
          typeList: args.typeList,
        },
      }
    )

    // If a job was updated, result[0][0] contains the job details
    return result[0]?.[0] || null
  } catch (error) {
    console.error('Failed to acquire job:', error)
    throw new Error('Error acquiring job')
  }
}
