const { getApolloServer } = require('./../lib/index')
const express = require('express')
const http = require('spdy')
const { PubSub } = require('graphql-subscriptions')
const { expressMiddleware } = require('@apollo/server/express4')
const { WebSocketServer } = require('ws')
const { json } = require('body-parser')
const cors = require('cors')

const config = require('./sqliteTestConfig.js')

async function startServer() {
  const app = express()
  var options = {
    spdy: {
      plain: true,
    },
  }
  const httpServer = http.createServer(options, app)

  const pubSubInstance = new PubSub()

  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: '/graphql',
  })

  const server = await getApolloServer(config, {
    wsServer,
    pubSubInstance,
    playground: true,
  })

  /**
   * This is the test server.
   * Used to allow the access to the Graphql Playground at this address: http://localhost:8080/graphql.
   * Each time the server is starter, the database is reset.
   */
  await server.start()

  app.use('/graphql', cors(), json(), expressMiddleware(server, {}))

  const port = process.env.PORT || 8080

  httpServer.listen(port, async () => {
    console.log(
      `🚀 http/https/h2 server runs on  http://localhost:${port}/graphql .`
    )
  })
}

startServer()
