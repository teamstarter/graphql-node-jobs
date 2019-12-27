[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Build Status](https://github.com/teamstarter/graphql-node-jobs/workflows/Node%20CI/badge.svg)](https://github.com/teamstarter/graphql-node-jobs/actions)

# graphql-node-jobs

A job scheduler, a runner and an interface to manage jobs. In one lib.

- What does it do?

It allows you to setup many execution pipelines and run them.

- How it works

NGJ (graphql-node-jobs) is available as:

- A standalone nodejs application
- A schema plugable to your Apollo server Schema

* Does the jobs persists if the server is stopped

By default the server runs on a local SQLite database. You can use your own database by providing a sequelize configuration.

Migration commands are available to migrate your database manually. We strongly advise to specify a dedicated schema when using your own database to avoid any naming overlap.

- How can I integrate NGJ to my app?

To use the api, there is [node-graphql-jobs-react](https://github.com/vincentdesmares/node-jobs-react) that provide convenient Components to list/trigger/delete and other useful actions.

## Table of Contents

- [Install](#install)
- [Project References](#project-references)

## Available commands

### Start the default server

```bash
npx gnj run
```

When the server is started, you can open the following url : http://localhost:8080/graphiql and discover the schema. If it's the first time you run it, an sqlite database will be created in the data folder relative to the path you started it.

You can also run the following command to run a server with a specific database.

```bash
npx gnj run ./../yourSequelizeConfigFile.js
```

GNJ is build as a microservice but can also be embedded in your application if needed. We advise to run it and the associated workers with a process manager like pm2.

### Migration the GNJ schema

```bash
npx gnj migrate ./../yourSequelizeConfigFile.js
```

### Start an In-memory server (no DB)

```bash
npx gnj run-in-memory
```

When the server is started, you can open the following url : http://localhost:8080/graphiql and discover the schema. If you shutdown the server, all data will be lost.

# Modifting Node-jobs

## Install the development environment

```bash
apt-get install git curl yarn
# or
brew install git curl yarn
```

_node & npm & yarn_

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
nvm install 12
nvm use 12
```

Get the project

```bash
git clone git@github.com:teamstarter/node-jobs.git
cd node-jobs
yarn
yarn start
```

## Be able to run bin files from the local node_modules folder

```bash
vim ~/.bashrc
#Add at the end of the file:
alias npm-exec='PATH=$(npm bin):$PATH'
npm-exec
:wq #Then save and quit
source ~/.bashrc
```

## Test the migration script locally

```bash
yarn run gnj migrate ./../tests/sqliteTestConfig.js
```

## Start a test server using the test database migrated previously

```bash
yarn start
```

## Running the test

```bash
yarn test
```

Debugging a specific test

```bash
node --inspect-brk ./node_modules/jest/bin/jest.js ./tests/job.spec.js
```

## Project References

[The React library](https://github.com/vincentdesmares/node-jobs-react)
