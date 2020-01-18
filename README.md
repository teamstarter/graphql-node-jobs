---
description: 'A job scheduler, a runner and an interface to manage jobs. In one lib.'
---

# Graphql-Node-Jobs

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![Build Status](https://github.com/teamstarter/graphql-node-jobs/workflows/Node%20CI/badge.svg)](https://github.com/teamstarter/graphql-node-jobs/actions)

### What does it do?

It allows you to setup many execution pipelines and run them.

### How it works

NGJ \(graphql-node-jobs\) is available as:

* A standalone NodeJS application
* A GraphQL schema plugable to your Apollo server Schema

### Does the jobs persists if the server is stopped

By default the server runs on a local SQLite database, created at the first start. You can use your own database by providing a Sequelize configuration.

Migration commands are available to migrate your database manually. We strongly advise to specify a dedicated schema when using your own database to avoid any naming overlap or data loss.

### How can I integrate NGJ to my app?

To use the api, there is [node-graphql-jobs-react](https://github.com/vincentdesmares/node-jobs-react) that provide convenient Components to list/trigger/delete and other useful actions. It uses Websockets by default to provide a near-realtime experience.

### Why using graphql-node-jobs?

Use GNJ is you want a SIMPLE, DATABASE agnostic, execution pipeline with a nice default React interface.

If you are using Postgresql and want high performances, [https://github.com/graphile/worker](https://github.com/graphile/worker) might be a better pick.

GNJ is kept small on purpose, the goal is to have the smallest API for the biggest impact.

### Table of Contents

{% page-ref page="contributing.md" %}

{% page-ref page="creating-a-worker.md" %}

* [Install](./#install)
* [Project References](./#project-references)

### Available commands

#### Start the default server

```bash
npx gnj run
```

When the server is started, you can open the following url : [http://localhost:8080/graphiql](http://localhost:8080/graphiql) and discover the schema. If it's the first time you run it, an sqlite database will be created in the data folder relative to the path you started it.

You can also run the following command to run a server with a specific database.

```bash
npx gnj run ./../yourSequelizeConfigFile.js
```

GNJ is build as a microservice but can also be embedded in your application if needed. We advise to run it and the associated workers with a process manager like pm2.

#### Migration the GNJ schema

```bash
npx gnj migrate ./../yourSequelizeConfigFile.js
```

#### Start an In-memory server \(no DB\)

```bash
npx gnj run-in-memory
```

When the server is started, you can open the following url : [http://localhost:8080/graphiql](http://localhost:8080/graphiql) and discover the schema. If you shutdown the server, all data will be lost.

### Project References

[The React library](https://github.com/vincentdesmares/node-jobs-react) [Architecture Documentation](https://docs.google.com/document/d/1r5F-kTZh_81AXy_9-DG4gMf9UwPJmfg6KBsCEK6Yero/edit#)

