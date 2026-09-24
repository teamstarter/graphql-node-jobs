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

The code is written in TypeScript in `src/`, and compiled with its type declarations into `lib/`, which is committed and published. The tests use `lib/` too, so build after each change and commit the `lib/` changes with the `src/` ones:

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

## Development server

`yarn start` serves the GraphQL API and its playground at `http://localhost:$PORT/graphql` (port 3333 with `.env.tmp`), with the compiled `lib/`:

```bash
yarn build
yarn start
```

It uses the database of `.env`, like the tests: it drops its tables, then runs the migrations and the seeders when it starts, and drops the tables again when it stops. So stop it before running the tests.

## Database changes

A change of the models in `src/models/` needs a migration in `migrations/`, named after its creation date so that it runs after the existing ones. The tests and `yarn start` run all the migrations.

Do not run `gnj migrate` on the database of `.env`: it records the executed migrations in another table than the tests, which would then run them again and fail.

## Commits and releases

Commit messages follow [Conventional Commits](https://conventionalcommits.org). `yarn release` builds the library, bumps the version and updates the [changelog](CHANGELOG.md) with [standard-version](https://github.com/conventional-changelog/standard-version).
