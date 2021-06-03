const { getApolloServer } = require('./../lib/index')
const express = require('express')
const http = require('spdy')
const { PubSub } = require('graphql-subscriptions')
const config = require('./sqliteTestConfig.js')
const app = express()

async function startServer() {
  var options = {
    spdy: {
      plain: true,
    },
  }

  const pubSubInstance = new PubSub()

  const server = await getApolloServer(config, { pubSubInstance })

  /**
   * This is the test server.
   * Used to allow the access to the Graphql Playground at this address: http://localhost:8080/graphql.
   * Each time the server is starter, the database is reset.
   */
  server.applyMiddleware({
    app,
    path: '/graphql',
  })

  const port = process.env.PORT || 8080

  const serverHttp = http.createServer(options, app).listen(port, async () => {
    console.log(
      `🚀 http/https/h2 server runs on  http://localhost:${port}/graphql .`
    )
  })

  server.installSubscriptionHandlers(serverHttp)
}

startServer()
