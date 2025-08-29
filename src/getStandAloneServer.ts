import { expressMiddleware } from '@apollo/server/express4'
import { json } from 'body-parser'
import cors from 'cors'
import { getApolloServer } from './../lib/index'

import { Sequelize } from 'sequelize'
import { JobType } from './types'

export default async function getStandAloneServer(
  dbConfig: any,
  gsgParams: any = {},
  customMutations: any = {},
  onJobFail?: (job: JobType) => Promise<any>,
  sequelizeInstance?: Sequelize
) {
  const express = require('express')
  const http2 = require('http')
  const { WebSocketServer } = require('ws')

  const app = express()
  const httpServer = http2.createServer(
    {
      spdy: {
        plain: true,
        // Augmenter les limites pour gros payloads
        maxSessionMemory: 100,
        settings: {
          maxFrameSize: 1048576, // 1MB par frame au lieu de 16KB
          initialWindowSize: 1048576, // 1MB window size
        },
      },
    },
    app
  )

  // Increase server timeouts for large payloads/slow connections
  const requestTimeoutMs = parseInt(process.env.GRAPHQL_REQUEST_TIMEOUT_MS || '300000', 10) // 5 minutes
  ;(httpServer as any).headersTimeout = requestTimeoutMs
  ;(httpServer as any).requestTimeout = requestTimeoutMs

  const graphqlPath = process.env.GRAPHQL_JOBS_PATH || '/graphql'
  const wsMaxPayload = parseInt(process.env.GRAPHQL_WS_MAX_PAYLOAD || `${100 * 1024 * 1024}`, 10) // default 100MB
  const wsDeflateEnabled = (process.env.GRAPHQL_WS_PERMESSAGE_DEFLATE || 'true') !== 'false'
  const wsDeflateThreshold = parseInt(process.env.GRAPHQL_WS_DEFLATE_THRESHOLD || '1024', 10)

  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: graphqlPath,
    maxPayload: wsMaxPayload,
    perMessageDeflate: wsDeflateEnabled
      ? {
          threshold: wsDeflateThreshold,
        }
      : false,
  })

  const server = await getApolloServer(
    {
      dbConfig,
      sequelizeInstance,
      gsgParams,
      customMutations,
      onJobFail,
      wsServer
    }
  )
  await server.start()

  const graphqlMaxBodySize = process.env.GRAPHQL_MAX_BODY_SIZE || '50mb'
  app.use(graphqlPath, cors(), json({ limit: graphqlMaxBodySize }), expressMiddleware(server, {}))

  const port = process.env.PORT || 8080

  httpServer.listen(port, async () => {
    console.log(
      `🚀 http/https/h2 server runs on  http://localhost:${port}/graphql .`
    )
  })

  return httpServer
}
