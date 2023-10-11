import {
  generateApolloServer,
  generateModelTypes,
} from '@teamstarter/graphql-sequelize-generator'
import getModels from '../models'
import { Job } from '../types'

import job from './job'
import batch from './batch'
import pipeline from './pipeline'
import pipelineStep from './pipelineStep'
import jobHoldType from './jobHoldType'
import { jobSuccessRating } from './jobSuccessRating'
import { workerMonitoring } from './workerMonitoring'

/**
 * @param dbConfig Sequelize database configuration object
 * @param gsgParams Params from graphql-sequelize-generator that overwrite the default ones.
 */
export default async function getApolloServer(
  dbConfig: any,
  gsgParams: any = {},
  customMutations: any = {},
  onJobFail?: (job: Job) => Promise<any>,
  wsServer: any = null
) {
  const models = await getModels(dbConfig)

  const types = generateModelTypes(models)

  const jobsFail = await models.job.findAll({
    where: { status: 'processing' },
  })

  if (jobsFail.length > 0) {
    await models.sequelize.query(
      "UPDATE job SET status = 'failed' WHERE status = 'processing'"
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
