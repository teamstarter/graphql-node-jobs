# Contributing

## Setup

You need Node.js 22.17 (see `.nvmrc`), Yarn 1 and a PostgreSQL server. The `db-*` scripts run one with Docker.

```bash
git clone git@github.com:teamstarter/graphql-node-jobs.git
cd graphql-node-jobs
nvm use
yarn
cp .env.tmp .env # Database settings, used by docker-compose and the tests
yarn db-start
```

## Building

The code is written in TypeScript in `src/`, and compiled into `lib/`, which is committed and published. The tests use `lib/` too, so build after each change and commit the `lib/` changes with the `src/` ones:

```bash
yarn build
```

## Testing

The tests run against the PostgreSQL database configured by the `PG*` variables of `.env`:

```bash
yarn test
```

To debug a single test file:

```bash
NO_ASYNC=true NODE_ENV=test PORT=3332 TZ=UTC node --inspect-brk ./node_modules/.bin/jest --config ./tests/jest.config.js --runInBand ./tests/job.spec.js
```

## Database changes

A change of the models in `src/models/` needs a migration in `migrations/`, named after its creation date so that it runs after the existing ones. To try the migrations on the database of `.env`:

```bash
yarn gnj migrate "$PWD/config/sequelizeConfig.js"
```

## Commits and releases

Commit messages follow [Conventional Commits](https://conventionalcommits.org). `yarn release` builds the library, bumps the version and updates the [changelog](CHANGELOG.md) with [standard-version](https://github.com/conventional-changelog/standard-version).
