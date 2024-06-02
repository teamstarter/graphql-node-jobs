import {
  generateApolloServer,
  generateModelTypes,
} from '@teamstarter/graphql-sequelize-generator'
import { getModelsAndInitializeDatabase } from '../models'
import { JobType } from '../types'

import { Sequelize } from 'sequelize'
import batch from './batch'
import job from './job'
import jobHoldType from './jobHoldType'
import { jobSuccessRating } from './jobSuccessRating'
import pipeline from './pipeline'
import pipelineStep from './pipelineStep'
import { workerMonitoring } from './workerMonitoring'
import { workerSuccessRating } from './workerSuccessRating'

/**
 * @param dbConfig Sequelize database configuration object
 * @param gsgParams Params from graphql-sequelize-generator that overwrite the default ones.
 */
export default async function getApolloServer({
  dbConfig,
  sequelizeInstance,
  gsgParams = {},
  customMutations = {},
  onJobFail,
  wsServer = null} : {
  dbConfig: any,
  sequelizeInstance?: Sequelize,
  gsgParams?: any,
  customMutations?: any,
  onJobFail?: (job: JobType) => Promise<any>,
  wsServer?: any
  }
) {
  const models = await getModelsAndInitializeDatabase({dbConfig, sequelizeInstance})

  const types = generateModelTypes(models)

  const jobsFail = await models.job.findAll({
    where: { status: 'processing' },
  })

  if (jobsFail.length > 0) {
    await models.sequelize.query(
      `UPDATE job SET status = 'cancelled', output = '{"error":"Cancelled as the job was processing during the server boot."}' WHERE status = 'processing';`
    )
    if (onJobFail) {
      for (const job of jobsFail) {
        await onJobFail(job)
      }
    }
  }

  const pubSub = gsgParams.pubSubInstance

  const graphqlSchemaDeclaration = {
    job: job(types, models, pubSub, onJobFail),
    batch: batch(types, models),
    pipeline: pipeline(types, models),
    pipelineStep: pipelineStep(types, models),
    jobHoldType: jobHoldType(types, models),
    workerMonitoring: workerMonitoring(models, pubSub),
    jobSuccessRating: jobSuccessRating(models),
    workerSuccessRating: workerSuccessRating(models),
  }

  return generateApolloServer({
    graphqlSchemaDeclaration,
    types,
    models,
    globalPreCallback: () => {},
    wsServer,
    apolloServerOptions: {
      playground: true,
      //context: addDataloaderContext,
      //   extensions: [
      //     () => new WebTransactionExtension(),
      //     () => new ErrorTrackingExtension()
      //   ],
      // Be sure to enable tracing
      tracing: false,
    },
    customMutations,
    ...gsgParams,
  })
}
