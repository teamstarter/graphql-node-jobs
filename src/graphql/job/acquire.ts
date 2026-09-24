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
import { Op } from 'sequelize'
import { isValidVersion, isVersionSatisfied } from '../../version'

interface AcquireJobArgs {
  typeList: string[]
  workerId?: string
  workerVersion?: string | null
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
      workerVersion: {
        type: GraphQLString,
        description:
          'Semver version of the code run by the worker. When provided, the jobs whose requiredMinimumVersion is greater than this version are not dispatched to the worker.',
      },
    },
    resolve: async (source: any, args: any, context: any) => {
      return acquireJob(models, args)
    },
  }
}

/**
 * Returns the requiredMinimumVersion values of the queued jobs that a worker
 * running `workerVersion` is allowed to process.
 *
 * Versions are compared with semver here rather than in SQL, then the
 * acquisition query only accepts these exact values. A job queued in the
 * meantime with another requiredMinimumVersion is not in the list, so it just
 * waits for the next acquisition instead of reaching an outdated worker.
 */
async function getSatisfiedRequiredVersions(
  models: SequelizeModels,
  typeList: string[],
  workerVersion: string
): Promise<string[]> {
  const jobs = await models.job.findAll({
    attributes: ['requiredMinimumVersion'],
    where: {
      type: typeList,
      status: 'queued',
      requiredMinimumVersion: { [Op.ne]: null },
    },
    group: ['requiredMinimumVersion'],
    raw: true,
  })

  return jobs
    .map((job: any) => job.requiredMinimumVersion)
    .filter((requiredMinimumVersion: string) =>
      isVersionSatisfied(workerVersion, requiredMinimumVersion)
    )
}

async function acquireJob(
  models: SequelizeModels,
  args: AcquireJobArgs
): Promise<any> {
  const hasWorkerVersion =
    args.workerVersion !== undefined && args.workerVersion !== null
  if (hasWorkerVersion && !isValidVersion(args.workerVersion)) {
    throw new Error(
      `The workerVersion must be a valid semver version (like "1.2.3"), got "${args.workerVersion}".`
    )
  }

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

    // Workers reporting their version only get the jobs without requirement or
    // whose requirement they satisfy. Workers not reporting it are not filtered.
    let satisfiedVersions: string[] = []
    let versionCondition = ''
    if (hasWorkerVersion) {
      satisfiedVersions = await getSatisfiedRequiredVersions(
        models,
        args.typeList,
        args.workerVersion as string
      )
      versionCondition =
        satisfiedVersions.length > 0
          ? `AND (job."requiredMinimumVersion" IS NULL OR
            job."requiredMinimumVersion" IN(:satisfiedVersions))`
          : `AND job."requiredMinimumVersion" IS NULL`
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
          ${versionCondition}
          AND type NOT IN (
            SELECT type
            FROM "jobHoldType" WHERE "deletedAt" IS NULL
          )
          AND job."deletedAt" IS NULL
        ORDER BY "priorityLevel" DESC, id ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      ) as subquery
      WHERE job.id = subquery.id
      RETURNING *;
      `,
      {
        replacements: {
          ...(args.workerId ? { workerId: args.workerId } : {}),
          ...(satisfiedVersions.length > 0 ? { satisfiedVersions } : {}),
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
