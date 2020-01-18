# Graphql-Node-Jobs

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![Build Status](https://github.com/teamstarter/graphql-node-jobs/workflows/Node%20CI/badge.svg)](https://github.com/teamstarter/graphql-node-jobs/actions)

'A job scheduler, a runner and an interface to manage jobs. In one lib.'

### What does it do?

It allows you to setup many execution pipelines and run them.

### How it works

NGJ \(graphql-node-jobs\) is available as:

- A standalone NodeJS application
- A GraphQL schema plugable to your Apollo server Schema

### Does the jobs persists if the server is stopped

By default the server runs on a local SQLite database, created at the first start. You can use your own database by providing a Sequelize configuration.

Migration commands are available to migrate your database manually. We strongly advise to specify a dedicated schema when using your own database to avoid any naming overlap or data loss.

### How can I integrate NGJ to my app?

To use the api, there is [node-graphql-jobs-react](https://github.com/vincentdesmares/node-jobs-react) that provide convenient Components to list/trigger/delete and other useful actions. It uses Websockets by default to provide a near-realtime experience.

### Why using graphql-node-jobs?

Use GNJ is you want a SIMPLE, DATABASE agnostic, execution pipeline with a nice default React interface.

If you are using Postgresql and want high performances, [https://github.com/graphile/worker](https://github.com/graphile/worker) might be a better pick.

GNJ is kept small on purpose, the goal is to have the smallest API for the biggest impact.

Get started with [the online documentation](https://vincent-desmares.gitbook.io/graphql-node-jobs/)
