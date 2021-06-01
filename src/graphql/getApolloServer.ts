import {
  generateApolloServer,
  generateModelTypes,
} from 'graphql-sequelize-generator'
import getModels from '../models'
import { Job } from '../types'

import job from './job'
import batch from './batch'
import pipeline from './pipeline'
import jobHoldType from './jobHoldType'

/**
 * @param dbConfig Sequelize database configuration object
 * @param gsgParams Params from graphql-sequelize-generator that overwrite the default ones.
 */
export default async function getApolloServer(
  dbConfig: any,
  gsgParams: any = {},
  customMutations: any = {},
  onJobFail?: (job: Job) => Promise<any>
) {
  const models = getModels(dbConfig)

  const types = generateModelTypes(models)

  await models.sequelize.query(
    "UPDATE job SET status = 'failed' WHERE status = 'processing'"
  )

  const graphqlSchemaDeclaration = {
    job: job(types, models, onJobFail),
    batch: batch(types, models),
    pipeline: pipeline(types, models),
    jobHoldType: jobHoldType(types, models),
  }

  return generateApolloServer({
    graphqlSchemaDeclaration,
    types,
    models,
    globalPreCallback: () => {},
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
