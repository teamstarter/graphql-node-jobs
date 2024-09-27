import {
  CustomMutationConfiguration,
  InAndOutTypes,
  SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/src/types/types'
import { GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql'
import { Op, Transaction } from 'sequelize'

interface AcquireJobArgs {
  typeList: string[]
  workerId?: string
  workerType?: string
}

export default function AcquireJobDefinition(
  graphqlTypes: InAndOutTypes,
  models: SequelizeModels
): CustomMutationConfiguration {
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
      const dialect = models.sequelize.getDialect()

      if (dialect === 'sqlite') {
        // Use optimistic concurrency control for SQLite
        return acquireJobSQLite(models, args)
      } else {
        // Use row-level locking for PostgreSQL and other databases
        return acquireJobWithRowLocking(models, args)
      }
    },
  }
}

async function acquireJobSQLite(
  models: SequelizeModels,
  args: AcquireJobArgs
): Promise<any> {
  const transaction = await models.sequelize.transaction()

  try {
    const allJobHoldType = await models.jobHoldType.findAll({ transaction })
    const heldTypes = allJobHoldType.map((heldType: any) => heldType.type)

    if (heldTypes.includes('all')) {
      await transaction.rollback()
      return null
    }

    const conditions: any[] = [
      {
        type: args.typeList,
        status: 'queued',
        [Op.or]: [
          { startAfter: null },
          { startAfter: { [Op.lt]: new Date() } },
        ],
      },
    ]

    if (heldTypes.length > 0) {
      conditions.push({
        type: { [Op.notIn]: heldTypes },
      })
    }

    // Find the job without locking
    const job = await models.job.findOne({
      where: {
        [Op.and]: conditions,
      },
      order: [['id', 'ASC']],
      transaction,
    })

    if (!job) {
      await transaction.rollback()
      return null
    }

    // Attempt to update the job's status to 'processing' only if it's still 'queued'
    const [updatedRows] = await models.job.update(
      {
        workerId: args.workerId,
        status: 'processing',
        startedAt: new Date(),
      },
      {
        where: {
          id: job.id,
          status: 'queued', // Ensure the job is still queued
        },
        transaction,
      }
    )

    if (updatedRows === 0) {
      // The job was acquired by another process
      await transaction.rollback()
      return null
    }

    await transaction.commit()

    // Return the updated job
    const updatedJob = await models.job.findByPk(job.id)
    return updatedJob
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function acquireJobWithRowLocking(
  models: SequelizeModels,
  args: AcquireJobArgs
): Promise<any> {
  const transaction = await models.sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  })

  try {
    const allJobHoldType = await models.jobHoldType.findAll({ transaction })
    const heldTypes = allJobHoldType.map((heldType: any) => heldType.type)

    if (heldTypes.includes('all')) {
      await transaction.rollback()
      return null
    }

    const conditions: any[] = [
      {
        type: args.typeList,
        status: 'queued',
        [Op.or]: [
          { startAfter: null },
          { startAfter: { [Op.lt]: new Date() } },
        ],
      },
    ]

    if (heldTypes.length > 0) {
      conditions.push({
        type: { [Op.notIn]: heldTypes },
      })
    }

    // Use row-level locking with 'FOR UPDATE' and 'SKIP LOCKED'
    const job = await models.job.findOne({
      where: {
        [Op.and]: conditions,
      },
      order: [['id', 'ASC']],
      transaction,
      lock: transaction.LOCK.UPDATE, // Acquires a row-level lock
      skipLocked: true, // Skips rows that are already locked
    })

    if (!job) {
      await transaction.rollback()
      return null
    }

    await job.update(
      {
        workerId: args.workerId,
        status: 'processing',
        startedAt: new Date(),
      },
      { transaction }
    )

    await transaction.commit()

    return job
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
