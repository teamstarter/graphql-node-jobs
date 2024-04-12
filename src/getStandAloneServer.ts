import { expressMiddleware } from '@apollo/server/express4'
import { json } from 'body-parser'
import cors from 'cors'
import { getApolloServer } from './../lib/index'

import { JobType } from './types'

export default async function getStandAloneServer(
  config: any,
  gsgParams: any = {},
  customMutations: any = {},
  onJobFail?: (job: JobType) => Promise<any>
) {
  const express = require('express')
  const http2 = require('http')
  const { WebSocketServer } = require('ws')

  const app = express()
  const httpServer = http2.createServer(
    {
      spdy: {
        plain: true,
      },
    },
    app
  )

  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: '/graphql',
  })

  const server = await getApolloServer(
    config,
    gsgParams,
    customMutations,
    onJobFail,
    wsServer
  )
  await server.start()

  app.use('/graphql', cors(), json(), expressMiddleware(server, {}))

  const port = process.env.PORT || 8080

  httpServer.listen(port, async () => {
    console.log(
      `🚀 http/https/h2 server runs on  http://localhost:${port}/graphql .`
    )
  })

  return httpServer
}
