import {
  CustomMutationConfiguration,
  InAndOutTypes,
  SequelizeModels,
} from '@teamstarter/graphql-sequelize-generator/src/types/types'
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql'
import { Op, Transaction } from 'sequelize'

interface AcquireJobArgs {
  typeList: string[]
  workerId?: string
  workerType?: string
  useRowLocking?: boolean
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
      useRowLocking: { type: GraphQLBoolean },
    },
    resolve: async (source: any, args: any, context: any) => {
      return acquireJobWithRetry(models, args, 5) // Retry up to 5 times
    },
  }
}

async function acquireJobWithRetry(
  models: SequelizeModels,
  args: AcquireJobArgs,
  maxAttempts: number
): Promise<any> {
  let attempt = 0
  const baseDelay = 100 // milliseconds
  const maxDelay = 2000 // milliseconds

  while (attempt < maxAttempts) {
    try {
      const useRowLocking = args.useRowLocking ?? false
      const supportsRowLevelLocking = await canUseRowLevelLocking(models)
      if (useRowLocking && supportsRowLevelLocking) {
        return await acquireJobWithRowLocking(models, args)
      } else {
        return await acquireJobWithOptimisticLocking(models, args)
      }
    } catch (error) {
      attempt++
      if (attempt >= maxAttempts) {
        console.error(
          `All retry attempts failed after ${attempt} tries:`,
          error
        )
        throw new Error('Error acquiring job after maximum retry attempts.')
      }
      const exponentialDelay = baseDelay * Math.pow(2, attempt)
      const delay = Math.min(
        exponentialDelay + Math.floor(Math.random() * baseDelay),
        maxDelay
      )
      console.log(`Retrying... attempt ${attempt}, waiting ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay)) // Wait before retrying
    }
  }
}

async function canUseRowLevelLocking(
  models: SequelizeModels
): Promise<boolean> {
  try {
    await models.sequelize.transaction(async (transaction) => {
      await models.job.findOne({
        lock: Transaction.LOCK.UPDATE,
        skipLocked: true,
        transaction,
      })
    })
    return true
  } catch (error) {
    console.error('Row level locking not supported:', error)
    return false
  }
}

async function acquireJobWithOptimisticLocking(
  models: SequelizeModels,
  args: AcquireJobArgs
): Promise<any> {
  try {
    const heldTypes = await getHeldTypes(models)
    if (heldTypes.includes('all')) {
      return null
    }
    const conditions = buildConditions(args, heldTypes)
    return await attemptJobAcquisition(models, conditions, args)
  } catch (error) {
    console.error('Failed to acquire job with optimistic locking:', error)
    return null
  }
}

async function acquireJobWithRowLocking(
  models: SequelizeModels,
  args: AcquireJobArgs
): Promise<any> {
  try {
    const transactionOptions = {
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    }
    return await models.sequelize.transaction(
      transactionOptions,
      async (transaction) => {
        const heldTypes = await getHeldTypes(models, transaction)
        if (heldTypes.includes('all')) {
          return null
        }
        const conditions = buildConditions(args, heldTypes)
        return await attemptJobAcquisition(
          models,
          conditions,
          args,
          transaction
        )
      }
    )
  } catch (error) {
    console.error('Failed to acquire job with row locking:', error)
    return null
  }
}

async function attemptJobAcquisition(
  models: SequelizeModels,
  conditions: any,
  args: AcquireJobArgs,
  transaction?: Transaction
): Promise<any> {
  try {
    const findOptions: any = {
      where: { [Op.and]: conditions },
      order: [['id', 'ASC']],
      transaction,
    }
    if (transaction) {
      findOptions.lock = Transaction.LOCK.UPDATE
      findOptions.skipLocked = true
    }

    const job = await models.job.findOne(findOptions)
    if (!job) {
      return null
    }
    const updateFields = {
      workerId: args.workerId,
      status: 'processing',
      startedAt: new Date(),
    }
    const updateOptions: any = {
      where: { id: job.id, status: 'queued' },
      transaction,
    }
    const [updatedRows] = await models.job.update(updateFields, updateOptions)
    if (updatedRows === 0) {
      return null
    }
    return await models.job.findByPk(job.id, { transaction })
  } catch (error) {
    console.error('Failed during job acquisition update:', error)
    return null
  }
}

async function getHeldTypes(
  models: SequelizeModels,
  transaction?: Transaction
): Promise<string[]> {
  try {
    const allJobHoldType = await models.jobHoldType.findAll({ transaction })
    console.log('All job hold types:', allJobHoldType)
    return allJobHoldType.map((heldType) => heldType.type)
  } catch (error) {
    console.error('Failed to retrieve job hold types:', error)
    throw error // Re-throwing the error to propagate it up the call stack
  }
}

function buildConditions(args: AcquireJobArgs, heldTypes: string[]): any {
  // Start with conditions that are always applied
  let conditions: any = [
    {
      type: args.typeList,
      status: 'queued',
      [Op.or]: [{ startAfter: null }, { startAfter: { [Op.lt]: new Date() } }],
    },
  ]

  if (heldTypes.length > 0) {
    conditions.push({
      type: { [Op.notIn]: heldTypes },
    })
  }

  return conditions
}
