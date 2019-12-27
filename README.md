[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Build Status](https://travis-ci.org/vincentdesmares/graphql-node-jobs.svg?branch=master)](https://travis-ci.org/teamstarter/graphql-node-jobs)

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

```bash
npx node-jobs start
```

When the server is starter, you can open the following url and discover the schema:

```
http://localhost:8080/graphiql
```

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

## TODO list

- [ ] Migrate the project to typescript
- [ ] Add pipelines
- [ ] Make batches work (with status "stashed")
- [ ] Delete old jobs when re-assigning them.
- [ ] ?

## Project References

[The React library](https://github.com/vincentdesmares/node-jobs-react)
