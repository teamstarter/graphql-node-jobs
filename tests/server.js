const { getApolloServer } = require('./../lib/index')
const { deleteTables, resetDatabase } = require('./test-database')
const express = require('express')
const http = require('spdy')
const { PubSub } = require('graphql-subscriptions')
const { expressMiddleware } = require('@apollo/server/express4')
const { WebSocketServer } = require('ws')
const { json } = require('body-parser')
const cors = require('cors')

const config = require('../config/sequelizeConfig')

async function startServer() {
  // Like the tests, which use the same database, the server starts from a
  // migrated and seeded database, and leaves it empty when stopped.
  await deleteTables()
  await resetDatabase()
  const stop = async () => {
    await deleteTables()
    process.exit()
  }
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)

  const app = express()
  var options = {
    spdy: {
      plain: true,
      // Augmenter les limites pour gros payloads
      maxSessionMemory: 100,
      settings: {
        maxFrameSize: 1048576, // 1MB par frame au lieu de 16KB
        initialWindowSize: 1048576, // 1MB window size
      },
    },
  }
  const httpServer = http.createServer(options, app)
  const requestTimeoutMs = parseInt(process.env.GRAPHQL_REQUEST_TIMEOUT_MS || '300000', 10)
  httpServer.headersTimeout = requestTimeoutMs
  httpServer.requestTimeout = requestTimeoutMs

  const pubSubInstance = new PubSub()

  const graphqlPath = process.env.GRAPHQL_PATH || '/graphql'
  const wsMaxPayload = parseInt(process.env.GRAPHQL_WS_MAX_PAYLOAD || `${100 * 1024 * 1024}`, 10)
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

  const server = await getApolloServer({
    dbConfig: config,
    gsgParams: {
      pubSubInstance,
      playground: true,
      // Apollo would otherwise exit on SIGINT and SIGTERM before `stop` empties the database.
      apolloServerOptions: { stopOnTerminationSignals: false },
    },
    wsServer,
  })

  /**
   * This is the development server, started with `yarn start`.
   * It serves the GraphQL API and its playground at http://localhost:${PORT}/graphql.
   */
  await server.start()

  const graphqlMaxBodySize = process.env.GRAPHQL_MAX_BODY_SIZE || '50mb'
  app.use(graphqlPath, cors(), json({ limit: graphqlMaxBodySize }), expressMiddleware(server, {}))

  const port = process.env.PORT || 8080

  httpServer.listen(port, async () => {
    console.log(
      `🚀 http/https/h2 server runs on  http://localhost:${port}/graphql .`
    )
  })
}

startServer()
