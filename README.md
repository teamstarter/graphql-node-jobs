# graphql-node-jobs

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![Build Status](https://github.com/teamstarter/graphql-node-jobs/workflows/Node%20CI/badge.svg)](https://github.com/teamstarter/graphql-node-jobs/actions)

A job scheduler, a runner and an interface to manage jobs. In one lib.

graphql-node-jobs (GNJ) stores jobs in PostgreSQL with Sequelize, exposes them through a GraphQL API, and provides the helpers to write the workers that process them. Workers only talk to the GraphQL API, so they can run in the same process as the server, in other services or on other machines.

- **Persistent**: jobs, with their input, output, progress and timings, are stored in your database.
- **Safe concurrency**: a job is acquired by a single worker, even when many workers poll at the same time.
- **Scheduling**: priorities, delayed jobs and jobs waiting for a minimum version of the workers.
- **Control**: cancellation, retries, recovery and holding job types.
- **Composition**: batches and pipelines to chain jobs.
- **Your stack**: runs standalone or inside your Apollo Server.

## Table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Database setup](#database-setup)
- [Running the server](#running-the-server)
- [Jobs](#jobs)
- [Workers](#workers)
- [Managing jobs](#managing-jobs)
- [GraphQL API](#graphql-api)
- [CLI](#cli)
- [Contributing](#contributing)

## Requirements

- Node.js 22.17 or later.
- PostgreSQL. Jobs are acquired with `FOR UPDATE SKIP LOCKED` and the statistics use materialized views, so other databases are not supported.
- The peer dependencies: `graphql` 16, `graphql-relay` 0.10, `graphql-sequelize` 9 and `sequelize` 6.28.0.

## Installation

```bash
yarn add @teamstarter/graphql-node-jobs graphql@^16.6.0 graphql-relay@^0.10.0 graphql-sequelize@^9.5.1 sequelize@6.28.0
```

The package includes its TypeScript declarations, with the types of the jobs (`JobType`, `JobInput`, `ProcessingInfo`...).

## Database setup

GNJ ships its own migrations. Run them with the `gnj` CLI and a Sequelize configuration file:

```bash
npx gnj migrate "$PWD/config/sequelizeConfig.js"
```

```js
// config/sequelizeConfig.js
module.exports = {
  // The entry matching NODE_ENV is used if it exists, the whole object otherwise.
  development: {
    dialect: 'postgres',
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  },
}
```

- The configuration is loaded with `require()` from inside the package, so give an absolute path.
- The executed migrations are tracked in the `gnj_sequelize_meta` table, so GNJ can share the database of your application. With `--dbhash <name>`, GNJ creates and uses a separate database called `<name>` on the same server instead.
- Run the migrations again after upgrading GNJ, new versions can add columns.

You can also migrate from your code:

```js
const {
  getModelsAndInitializeDatabase,
  migrate,
} = require('@teamstarter/graphql-node-jobs')

const models = await getModelsAndInitializeDatabase({ dbConfig })
await migrate(models)
```

## Running the server

### Standalone

```js
const { getStandAloneServer } = require('@teamstarter/graphql-node-jobs')
const dbConfig = require('./config/sequelizeConfig')

const httpServer = await getStandAloneServer(dbConfig)
// 🚀 http/https/h2 server runs on http://localhost:8080/graphql .
```

`getStandAloneServer(dbConfig, gsgParams, customMutations, onJobFail, sequelizeInstance)`:

| Parameter           | Description                                                                                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dbConfig`          | The Sequelize configuration.                                                                                                                                                                                                                      |
| `gsgParams`         | Options given to [graphql-sequelize-generator](https://github.com/teamstarter/graphql-sequelize-generator), such as `apolloServerOptions`. Give a `pubSubInstance` (a `PubSub` from `graphql-subscriptions`) to enable the GraphQL subscriptions. |
| `customMutations`   | Additional GraphQL mutations to add to the schema.                                                                                                                                                                                                |
| `onJobFail`         | `async (job) => {}`, called when a job fails, see [Server hooks](#server-hooks).                                                                                                                                                                  |
| `sequelizeInstance` | An existing Sequelize instance to use instead of creating one from `dbConfig`.                                                                                                                                                                    |

The standalone server reads these environment variables:

| Variable                        | Default     | Description                                                   |
| ------------------------------- | ----------- | ------------------------------------------------------------- |
| `PORT`                          | `8080`      | Port of the server.                                           |
| `GRAPHQL_JOBS_PATH`             | `/graphql`  | Path of the GraphQL endpoint, for HTTP and WebSocket.         |
| `GRAPHQL_REQUEST_TIMEOUT_MS`    | `300000`    | Request and headers timeout, in milliseconds.                 |
| `GRAPHQL_MAX_BODY_SIZE`         | `50mb`      | Maximum size of a request body.                               |
| `GRAPHQL_WS_MAX_PAYLOAD`        | `104857600` | Maximum size of a WebSocket message, in bytes.                |
| `GRAPHQL_WS_PERMESSAGE_DEFLATE` | `true`      | Set to `false` to disable the WebSocket compression.          |
| `GRAPHQL_WS_DEFLATE_THRESHOLD`  | `1024`      | Minimum size of a WebSocket message to compress it, in bytes. |

### Inside your Apollo Server

`getApolloServer` returns an Apollo Server 4 instance serving the GNJ schema, to mount wherever you want:

```js
const express = require('express')
const http = require('http')
const cors = require('cors')
const { json } = require('body-parser')
const { WebSocketServer } = require('ws')
const { expressMiddleware } = require('@apollo/server/express4')
const { PubSub } = require('graphql-subscriptions')
const { getApolloServer } = require('@teamstarter/graphql-node-jobs')

const app = express()
const httpServer = http.createServer(app)
const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' })

const server = await getApolloServer({
  dbConfig,
  gsgParams: { pubSubInstance: new PubSub() },
  wsServer,
  // Also accepts sequelizeInstance, customMutations and onJobFail.
})
await server.start()

app.use('/graphql', cors(), json({ limit: '50mb' }), expressMiddleware(server))
httpServer.listen(8080)
```

### Server hooks

- When a server boots, the jobs still `processing` are considered interrupted (by a crash or a deployment for example): they are set to `cancelled` and `onJobFail` is called for each of them.
- `onJobFail(job)` is also called each time a job is updated to `failed`.

## Jobs

### Creating jobs

With the GraphQL client, from any Node.js process:

```js
const { createJob, getNewClient } = require('@teamstarter/graphql-node-jobs')

const client = getNewClient('http://localhost:8080/graphql')

await createJob(client, {
  type: 'send-email',
  name: 'Welcome email',
  input: { userId: 42 },
})
```

Or with the `jobCreate` GraphQL mutation, or directly with the Sequelize models in the server process:

```js
const models = await getModelsAndInitializeDatabase({ dbConfig })
await models.job.create({ type: 'send-email', input: { userId: 42 } })
```

The main fields of a job:

| Field                                 | Description                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `type`                                | Required. Workers pick jobs by type.                                                                                          |
| `name`                                | A free label.                                                                                                                 |
| `input`                               | JSON given to the worker.                                                                                                     |
| `output`                              | JSON returned by the worker, or the error when the job failed.                                                                |
| `processingInfo`                      | JSON progress reported by the worker, see [Reporting progress](#reporting-progress).                                          |
| `status`                              | See [Statuses](#statuses).                                                                                                    |
| `priorityLevel`                       | See [Priorities](#priorities).                                                                                                |
| `startAfter`                          | The job is not dispatched before this date.                                                                                   |
| `requiredMinimumVersion`              | See [Waiting for a minimum worker version](#waiting-for-a-minimum-worker-version).                                            |
| `jobUniqueId`                         | Deduplication key: creating a job through GraphQL with the `jobUniqueId` of an existing job returns the existing job instead. |
| `isRecoverable`                       | Allows to [recover](#retrying-and-recovering-jobs) the job when it fails.                                                     |
| `isHighFrequency`                     | Flag for the jobs created very often, for example to filter them out of job lists.                                            |
| `batchId`, `pipelineId`               | See [Batches and pipelines](#batches-and-pipelines).                                                                          |
| `workerId`                            | The worker that acquired the job.                                                                                             |
| `retryOfJobId`                        | The job this one is a retry of.                                                                                               |
| `startedAt`, `endedAt`, `cancelledAt` | Set by the server.                                                                                                            |

### Statuses

| Status             | Description                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `planned`          | Waits for its batch or pipeline step to be started. Jobs created with a `batchId` or a `pipelineId` start with this status, unless another one is given. |
| `queued`           | Waits for a worker. The default status of a new job.                                                                        |
| `processing`       | Acquired by a worker.                                                                                                       |
| `successful`       | The worker processed it.                                                                                                    |
| `failed`           | The worker threw an error.                                                                                                  |
| `cancel-requested` | A cancellation was requested while it was processing, see [Cancellation](#cancellation).                                    |
| `cancelled`        | Cancelled.                                                                                                                  |

### Priorities

Jobs are dispatched by decreasing `priorityLevel`, then in their creation order. Any integer can be used, and three constants are exported:

```js
const {
  PRIORITY_LOW, // 1
  PRIORITY_MED, // 4, the default
  PRIORITY_HIGH, // 8
} = require('@teamstarter/graphql-node-jobs')

await createJob(client, { type: 'export', priorityLevel: PRIORITY_HIGH })
```

### Delayed jobs

A job with a `startAfter` date is not dispatched before this date:

```js
await createJob(client, {
  type: 'reminder',
  startAfter: new Date(Date.now() + 60 * 60 * 1000), // In one hour
})
```

### Waiting for a minimum worker version

The code creating a job and the workers processing it do not always run the same version. Typically, during the deployment of a release 2.0.0, a migration schedules a job relying on code of this release while the workers still run the release 1.9.0 until they are restarted.

Give the job a `requiredMinimumVersion`, and make the workers report their version with the `workerVersion` option of `checkForJobs`:

```js
// In a migration of the release 2.0.0
await createJob(client, {
  type: 'backfill-invoices',
  requiredMinimumVersion: '2.0.0', // or require('../package.json').version
})

// In the workers
checkForJobs({
  client,
  typeList: ['backfill-invoices'],
  workerVersion: require('./package.json').version,
  processingFunction,
})
```

The workers reporting 1.9.0 skip the job, without blocking the other jobs of the queue, and the first worker restarted with 2.0.0 or later processes it right away. No time window to guess: the job can neither start too early on an outdated worker nor be run later than needed.

- Versions follow [Semantic Versioning](https://semver.org): `1.9.0 < 1.10.0` and `2.0.0-rc.1 < 2.0.0`. Invalid versions are rejected, for both `requiredMinimumVersion` and `workerVersion`.
- Only the workers reporting a version are filtered: a worker without `workerVersion` can still acquire the job. Make sure that all the workers processing these job types report their version.
- A retried job keeps its `requiredMinimumVersion`.
- Upgrade and migrate the GNJ server before the workers start sending a `workerVersion`, older servers reject this argument. Workers without `workerVersion` work with any server.

## Workers

### Processing jobs

```js
const { checkForJobs, getNewClient } = require('@teamstarter/graphql-node-jobs')

const client = getNewClient('http://localhost:8080/graphql')

checkForJobs({
  client,
  typeList: ['send-email'],
  processingFunction: async (job, { updateProcessingInfo }) => {
    await sendEmail(job.input)
    return { sent: true }
  },
})
```

`checkForJobs` acquires a job of one of the given types and runs `processingFunction` with it:

- What the function returns is stored as the job `output`, and the job becomes `successful`.
- If it throws, the job becomes `failed` and its `output` contains the error with its stack.

Then it looks for the next job right away, or after `loopTime` when there was none.

| Option                       | Default    | Description                                                                                                                                                       |
| ---------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`                     | Required   | An Apollo client created by `getNewClient(uri)`.                                                                                                                  |
| `typeList`                   | Required   | The types of jobs to process.                                                                                                                                     |
| `processingFunction`         | Required   | `async (job, { updateProcessingInfo }) => output`.                                                                                                                |
| `workerId`                   | A new UUID | Stored in the `workerId` of the acquired jobs.                                                                                                                    |
| `workerVersion`              |            | Semver version of the code run by the worker, see [Waiting for a minimum worker version](#waiting-for-a-minimum-worker-version).                                  |
| `looping`                    | `true`     | Keep looking for jobs. With `false`, `checkForJobs` checks once and resolves with the processed job, or `null` when there was none. Useful for tests and scripts. |
| `loopTime`                   | `1000`     | Milliseconds to wait before looking again when no job was available.                                                                                              |
| `nonBlocking`                | `false`    | Look for the next job without waiting for the current one to be processed. The jobs are then processed concurrently, without limit.                               |
| `isCancelledOnCancelRequest` | `false`    | Make `updateProcessingInfo` throw a `CancelRequestedError` when the cancellation of the job is requested, see [Cancellation](#cancellation).                      |

### Reporting progress

`updateProcessingInfo` saves a JSON object in the `processingInfo` of the job:

```js
processingFunction: async (job, { updateProcessingInfo }) => {
  await updateProcessingInfo({
    steps: {
      download: { name: 'download', status: 'done' },
      transform: { name: 'transform', status: 'processing' },
    },
  })
  // ...
}
```

When it contains `steps` keyed by name, each step is merged with its previously saved values, and the server sets `doneAt` and `elapsedTime` on the steps reaching the `done` status. The `elapsedTime` is the number of milliseconds since the previous step was done, or since the job started.

### Cancellation

Request the cancellation of a job by updating its status to `cancel-requested`, with the `jobUpdate` mutation:

- A `queued` job is cancelled right away.
- A `processing` job is cancelled by its worker. With `isCancelledOnCancelRequest: true`, the next `updateProcessingInfo` call throws a `CancelRequestedError`. Let it propagate, and the job becomes `cancelled`. You can also throw a `CancelRequestedError` yourself. Without this option, the job fails at the second `updateProcessingInfo` call following the request.

```js
const { CancelRequestedError } = require('@teamstarter/graphql-node-jobs')
```

### Other helpers

| Helper                                                      | Description                                                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| `getNewClient(uri, wsUri, apolloClientOptions)`             | Creates the Apollo client. `wsUri` is only needed for subscriptions.       |
| `createJob(client, job)`                                    | Creates a job, see [Creating jobs](#creating-jobs).                        |
| `listJobs(client, { where, order, limit, offset })`         | Lists jobs.                                                                |
| `toggleHoldJobType(client, type)`                           | Holds or releases a job type, see [Holding job types](#holding-job-types). |
| `listJobHoldTypes(client, { where, order, limit, offset })` | Lists the held job types.                                                  |

## Managing jobs

### Holding job types

The jobs of a held type are not dispatched until the type is released. Toggle a type with the `toggleHoldJobType(type: String!)` mutation or the `toggleHoldJobType` helper. Holding the type `all` pauses every job type.

### Retrying and recovering jobs

- `retryJob(id: Int!)` copies a `failed` or `cancelled` job into a new `queued` job, whose `retryOfJobId` references the original one.
- `recover(id: Int!)` puts a `failed` job back in the queue if it has the `isRecoverable` flag. It keeps its `processingInfo`, so the worker can resume where it stopped.

### Batches and pipelines

A batch groups jobs. Create it with `batchCreate`, then create jobs with its `batchId`. When its jobs end, the batch becomes `successful` if they all succeeded, `failed` otherwise. Jobs created with a `batchId` start `planned`, so give them the `queued` status if the batch is not part of a pipeline.

A pipeline runs steps one after the other, each step being a job or a batch:

1. Create the pipeline with `pipelineCreate`.
2. Create jobs or batches with its `pipelineId`. Each one becomes the next step of the pipeline.
3. Start it with `startPipeline(id: Int!)`, which queues the first step. Each time a step ends, the next one is queued.

The pipeline becomes `successful` when all its steps succeeded, `failed` otherwise.

### Statistics and monitoring

- `jobSuccessRating` returns, per day over the last 30 days, the number of successful and failed jobs and the success rate.
- `workerSuccessRating` returns, per hour and worker type, the share of each worker status (`AVAILABLE`, `PROCESSING`, `FAILED`, `EXITED`) reported with `workerMonitoringUpdate`.
- The `ping`, `pong` and `workerMonitoringUpdate` mutations, with the matching subscriptions, allow to monitor the workers.

The statistics are PostgreSQL materialized views that GNJ does not refresh. Refresh them when needed, for example on a schedule, with `REFRESH MATERIALIZED VIEW "jobSuccessRating"` and `REFRESH MATERIALIZED VIEW "workerSuccessRating"`.

## GraphQL API

The schema is generated from the models by [graphql-sequelize-generator](https://github.com/teamstarter/graphql-sequelize-generator):

- **Queries**: `job`, `batch`, `pipeline`, `pipelineStep`, `jobHoldType`, `workerMonitoring`, `jobSuccessRating`, `workerSuccessRating`, with `where`, `order`, `limit` and `offset` arguments, and their `*Count` queries.
- **Mutations**: `jobCreate`, `jobUpdate`, `acquireJob`, `retryJob`, `recover`, `toggleHoldJobType`, `batchCreate`, `batchUpdate`, `pipelineCreate`, `pipelineUpdate`, `startPipeline`, `pipelineStepCreate`, `pipelineStepUpdate`, `ping`, `pong`, `workerMonitoringUpdate`.
- **Subscriptions**, when a `pubSubInstance` is given: `jobCreated`, `jobUpdated`, `jobDeleted`, `pinged`, `ponged`, `workerMonitoringUpdated`.

The [online documentation](https://teamstarter.github.io/gnj-documentation/) has more examples, but may not be up to date.

## CLI

| Command                                             | Description                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `gnj migrate <configPath> [--dbhash <name>]`        | Runs the migrations, see [Database setup](#database-setup).              |
| `gnj seedJobs <configPath> <nbDays> <nbJobsPerDay>` | Generates fake jobs. Only when `NODE_ENV=development`.                   |
| `gnj seedWorkerLogs <configPath> <nbHours>`         | Generates fake worker monitoring logs. Only when `NODE_ENV=development`. |

## Contributing

See [contributing.md](contributing.md) and the [changelog](CHANGELOG.md).

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)
