# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.0.1](https://github.com/teamstarter/graphql-node-jobs/compare/v4.0.0...v4.0.1) (2025-08-28)


### Bug Fixes

* **server:** Increase JSON body parser limit for GraphQL endpoint ([#92](https://github.com/teamstarter/graphql-node-jobs/issues/92)) ([c82fa72](https://github.com/teamstarter/graphql-node-jobs/commit/c82fa721f541d8381adbb1ef321b9eb1c8d3d05d))

## [4.0.0](https://github.com/teamstarter/graphql-node-jobs/compare/v3.2.0...v4.0.0) (2025-04-09)


### ⚠ BREAKING CHANGES

* **GSG:** Upgrade to last version of GSG>

* **GSG:** Upgrade to last version of GSG ([9a6b343](https://github.com/teamstarter/graphql-node-jobs/commit/9a6b3430317d7e9280326516488147674b8e0b94))

## [3.2.0](https://github.com/teamstarter/graphql-node-jobs/compare/v3.1.0...v3.2.0) (2025-03-26)


### Features

* **hooks:** Adapt hook signatures. ([95c63c8](https://github.com/teamstarter/graphql-node-jobs/commit/95c63c8ad47c553d6c38695d2a55f7b7cbe17f0d))

## [3.1.0](https://github.com/teamstarter/graphql-node-jobs/compare/v3.0.6...v3.1.0) (2025-03-24)


### Features

* **GSG:** Upgrade to GSG 9.0.1 ([935e51f](https://github.com/teamstarter/graphql-node-jobs/commit/935e51f6b9a61d22dfb9e598480cf690ad6cbc55))

### [3.0.6](https://github.com/teamstarter/graphql-node-jobs/compare/v3.0.5...v3.0.6) (2025-02-11)

### [3.0.5](https://github.com/teamstarter/graphql-node-jobs/compare/v3.0.4...v3.0.5) (2025-02-11)

### [3.0.4](https://github.com/teamstarter/graphql-node-jobs/compare/v3.0.3...v3.0.4) (2025-01-10)

### [3.0.3](https://github.com/teamstarter/graphql-node-jobs/compare/v3.0.2...v3.0.3) (2025-01-10)

### [3.0.2](https://github.com/teamstarter/graphql-node-jobs/compare/v3.0.1...v3.0.2) (2024-06-04)


### Bug Fixes

* **types:** Upgrade GSG to fix CI. ([ef68399](https://github.com/teamstarter/graphql-node-jobs/commit/ef6839926ebfcb9d417b7a31f603a2a3cfeecd57))

### [3.0.1](https://github.com/teamstarter/graphql-node-jobs/compare/v3.0.0...v3.0.1) (2024-06-02)


### Bug Fixes

* **job:** Change transaction type. ([3b3a8a5](https://github.com/teamstarter/graphql-node-jobs/commit/3b3a8a5b11836fe4decddb9742db91940d8e54bf))
* **job:** Fix undocumented async behavior. Moving it to a sync behavior for now. ([72fd970](https://github.com/teamstarter/graphql-node-jobs/commit/72fd970cf4da21f136b751c018b138edeed5a28a))

## [3.0.0](https://github.com/teamstarter/graphql-node-jobs/compare/v2.3.1...v3.0.0) (2024-06-02)


### ⚠ BREAKING CHANGES

* **db:** Change the signature of getApolloServer.

### Features

* **db:** Allow to provide a sequelizeInstance. ([458593d](https://github.com/teamstarter/graphql-node-jobs/commit/458593d075ab0030e30f6e85117dc636d9ffe331))

### [2.3.1](https://github.com/teamstarter/graphql-node-jobs/compare/v2.3.0...v2.3.1) (2024-04-22)


### Bug Fixes

* **types:** Fix typo in success type. ([27e75b3](https://github.com/teamstarter/graphql-node-jobs/commit/27e75b3c767a02089bbef0237a34124853901709))
* **worker:** Fix invalid subscription triggered in the worker loop. ([f92724b](https://github.com/teamstarter/graphql-node-jobs/commit/f92724bb0379b50fd9c4788322156fd7d450f8f5))

## [2.3.0](https://github.com/teamstarter/graphql-node-jobs/compare/v2.2.2...v2.3.0) (2024-04-19)


### Features

* **worker:** Add a new "nonBlocking" parameter to checkForJobs that allows for parallele processing of all jobs of a given worker. ([98220a3](https://github.com/teamstarter/graphql-node-jobs/commit/98220a3180152a4e31e03371290bc48f5dfe189f))

### [2.2.2](https://github.com/teamstarter/graphql-node-jobs/compare/v2.2.1...v2.2.2) (2024-04-19)

### [2.2.1](https://github.com/teamstarter/graphql-node-jobs/compare/v2.2.0...v2.2.1) (2024-04-15)


### Bug Fixes

* **acquire:** Fix transaction allowing repeatable/uncommitted reads. the Acquire() function must work as a semaphore and always return an unique job without throwing in case of conflict. ([52cd5ed](https://github.com/teamstarter/graphql-node-jobs/commit/52cd5ed0ec5aa66a657b2b6b83c9052fe2647358))

## [2.2.0](https://github.com/teamstarter/graphql-node-jobs/compare/v2.1.0...v2.2.0) (2024-04-12)


### Features

* **typescript:** Export types. ([b0838b8](https://github.com/teamstarter/graphql-node-jobs/commit/b0838b8ecd01d98b663f0e0c19e37fde40699e8c))

## [2.1.0](https://github.com/teamstarter/graphql-node-jobs/compare/v2.0.2...v2.1.0) (2024-04-12)


### Features

* **build:** Force build before release. ([7b6cd83](https://github.com/teamstarter/graphql-node-jobs/commit/7b6cd837a64a671394b5babd294470876021e217))

### [2.0.2](https://github.com/teamstarter/graphql-node-jobs/compare/v2.0.1...v2.0.2) (2024-04-12)


### Bug Fixes

* **getModels:** Fix bad initialization. ([7bf1027](https://github.com/teamstarter/graphql-node-jobs/commit/7bf102725a992f4e07c574aeb6b53e6eea9e809b))

### [2.0.1](https://github.com/teamstarter/graphql-node-jobs/compare/v2.0.0...v2.0.1) (2024-04-12)


### Bug Fixes

* **models:** Fix getModels signature. ([9b46d76](https://github.com/teamstarter/graphql-node-jobs/commit/9b46d768bb46b1591d125d4dfcacfbba2ce8d1b3))

## [2.0.0](https://github.com/teamstarter/graphql-node-jobs/compare/v1.5.1...v2.0.0) (2024-04-12)


### ⚠ BREAKING CHANGES

* **models:** getModels now returns the models synchronously.

### Features

* **models:** getModels now returns the models synchronously. dbhash is not anymore provided to getModels. Use async getModelsAndInitializeDatabase if needed. ([5fa7fba](https://github.com/teamstarter/graphql-node-jobs/commit/5fa7fbad346812a59468cd7cfc5b469d187919f2))

### [1.5.1](https://github.com/teamstarter/graphql-node-jobs/compare/v1.5.0...v1.5.1) (2024-03-26)


### Bug Fixes

* **date-fns:** Avoid dependency to a new function. ([f5fe261](https://github.com/teamstarter/graphql-node-jobs/commit/f5fe261d6e4cccff80a2a59cf99fc51a3f29f8fc))

## [1.5.0](https://github.com/teamstarter/graphql-node-jobs/compare/v1.4.3...v1.5.0) (2024-03-26)


### Features

* **boot:** When a job is cancelled as server start it uses the status 'cancelled' and the ouput is explicit about the cancelation reason. ([50cc8c5](https://github.com/teamstarter/graphql-node-jobs/commit/50cc8c52dbeff537efbcf56c1fe4941b3aea8eeb))


### Bug Fixes

* **processingInfo:** Fix a regression on the steps elapsed time calculation. ([ac123bb](https://github.com/teamstarter/graphql-node-jobs/commit/ac123bb84f2f885ada75863c99ab761139d089a6))

### [1.4.3](https://github.com/teamstarter/graphql-node-jobs/compare/v1.4.2...v1.4.3) (2024-02-27)


### Bug Fixes

* **updateProcessingInfo:** Fix updateProcessingInfo not updating steps when they were not move to done. ([#85](https://github.com/teamstarter/graphql-node-jobs/issues/85)) ([a770bf4](https://github.com/teamstarter/graphql-node-jobs/commit/a770bf400850648467be50125265d724e836407a)), closes [#79](https://github.com/teamstarter/graphql-node-jobs/issues/79)

### [1.4.2](https://github.com/teamstarter/graphql-node-jobs/compare/v1.4.1...v1.4.2) (2023-10-31)

### [1.4.1](https://github.com/teamstarter/graphql-node-jobs/compare/v1.4.0...v1.4.1) (2023-10-27)


### Bug Fixes

* **migration-workers:** add extension pgcrypto to pg extension ([2bf897f](https://github.com/teamstarter/graphql-node-jobs/commit/2bf897ffe7ab24451636875dcb20226060ce25d1))

## [1.4.0](https://github.com/teamstarter/graphql-node-jobs/compare/v1.3.1...v1.4.0) (2023-10-27)


### Features

* **workerSuccessRating:** MV workerSuccessRating implemented ([#83](https://github.com/teamstarter/graphql-node-jobs/issues/83)) ([26b8c11](https://github.com/teamstarter/graphql-node-jobs/commit/26b8c11ab3ab8b8ce6899512459a3e91ea269dd2))

### [1.3.1](https://github.com/teamstarter/graphql-node-jobs/compare/v1.3.0...v1.3.1) (2023-10-18)


### Bug Fixes

* **wM-Migration:** worker monitoring migration fixed to match older db ([8a11186](https://github.com/teamstarter/graphql-node-jobs/commit/8a111863048f204270c916f4d5c6c2dd06a7193f))

## [1.3.0](https://github.com/teamstarter/graphql-node-jobs/compare/v1.2.0...v1.3.0) (2023-10-11)


### Features

* **SequelizeGeneratorPackage:** package updated ([de91729](https://github.com/teamstarter/graphql-node-jobs/commit/de91729e095735224b71ca6078def4a74b9ec8d7))

## [1.2.0](https://github.com/teamstarter/graphql-node-jobs/compare/v1.1.0...v1.2.0) (2023-10-11)


### Features

* **JobSuccessV2:** snapshot updated + double migration removed + test protection ([#81](https://github.com/teamstarter/graphql-node-jobs/issues/81)) ([6bc9bb0](https://github.com/teamstarter/graphql-node-jobs/commit/6bc9bb03f63d048e0a327b31059b5720939e3de3))

## [1.1.0](https://github.com/teamstarter/graphql-node-jobs/compare/v1.0.0...v1.1.0) (2023-10-11)


### Features

* **jobSuccess:** new materialized view about jobSuccess ([#77](https://github.com/teamstarter/graphql-node-jobs/issues/77)) ([d464793](https://github.com/teamstarter/graphql-node-jobs/commit/d4647938e499c7c8131a3344a1d97f401f10b59a))

## [1.0.0](https://github.com/teamstarter/graphql-node-jobs/compare/v0.5.3...v1.0.0) (2023-01-31)


### ⚠ BREAKING CHANGES

* **tech-dept:** Upgrade to Apollo 4 and add a reference to it in the doc.

### Features

* **tech-dept:** Upgrade to Apollo 4 and add a reference to it in the doc. ([72b875b](https://github.com/teamstarter/graphql-node-jobs/commit/72b875ba6b02ee6642c085589db83b9f3b8e4336))

### [0.5.3](https://github.com/teamstarter/graphql-node-jobs/compare/v0.5.2...v0.5.3) (2022-07-13)


### Bug Fixes

* **job:** fix elapsedTime ([#60](https://github.com/teamstarter/graphql-node-jobs/issues/60)) ([dd13071](https://github.com/teamstarter/graphql-node-jobs/commit/dd13071f675148fcd66ab875700c0b4b5b9349a0))

### [0.5.2](https://github.com/teamstarter/graphql-node-jobs/compare/v0.5.1...v0.5.2) (2022-06-29)

### [0.5.1](https://github.com/teamstarter/graphql-node-jobs/compare/v0.5.0...v0.5.1) (2022-05-20)

## [0.5.0](https://github.com/teamstarter/graphql-node-jobs/compare/v0.4.0...v0.5.0) (2021-10-19)


### ⚠ BREAKING CHANGES

* **dependencies:** You must add graphql-sequelize-generator as a dependency.

### Features

* **retry:** Avoid duplicating attributes related to the running of a job when duplicating it. ([ff013b0](https://github.com/teamstarter/graphql-node-jobs/commit/ff013b07e8459b255c5095303f134b8b991237ab))


### Bug Fixes

* **dependencies:** graphql-sequelize-generator is now peer dep. ([b0cf48b](https://github.com/teamstarter/graphql-node-jobs/commit/b0cf48b90e72e7ca228a346110ead3c37e4ccb58))

## [0.4.0](https://github.com/teamstarter/graphql-node-jobs/compare/v0.3.9...v0.4.0) (2021-06-14)


### ⚠ BREAKING CHANGES

* **job:** The getApolloServer function now returns a promise.

### Features

* **job:** update processing job status to failed when booting server ([#40](https://github.com/teamstarter/graphql-node-jobs/issues/40)) ([970ba94](https://github.com/teamstarter/graphql-node-jobs/commit/970ba9448ea8fe0f9ce044ff9a01fcfa7957ecb5))
* **workerMonitoring:** add model & logic ([#39](https://github.com/teamstarter/graphql-node-jobs/issues/39)) ([6c1f25e](https://github.com/teamstarter/graphql-node-jobs/commit/6c1f25e0e99d59cef10c24b4878d323885ca6ed7))

### [0.3.9](https://github.com/teamstarter/graphql-node-jobs/compare/v0.3.8...v0.3.9) (2021-06-01)


### Features

* **job:** added the update of batch ([6285585](https://github.com/teamstarter/graphql-node-jobs/commit/628558591c58a851b7c9d4f40af1a39d4b263a2b))
* **pipeline:** add field status to model pipeline ([454647c](https://github.com/teamstarter/graphql-node-jobs/commit/454647c20a21003d5824d5617c170616fb454987))
* **pipeline:** add logic for dispatch job ([20d4a61](https://github.com/teamstarter/graphql-node-jobs/commit/20d4a61d58adc9b80a12582b7e502809fdfe9ffe))
* **pipeline:** add model pipelineStep ([3460423](https://github.com/teamstarter/graphql-node-jobs/commit/34604239659d83e5201a607fa59a3efc763158a9))
* **recover:** update description ([299749d](https://github.com/teamstarter/graphql-node-jobs/commit/299749d18736bef14488e5af20d7828b301d2006))

### [0.3.8](https://github.com/teamstarter/graphql-node-jobs/compare/v0.3.7...v0.3.8) (2021-05-21)

### [0.3.7](https://github.com/teamstarter/graphql-node-jobs/compare/v0.3.6...v0.3.7) (2020-11-30)


### Features

* **job:** Instantly cancel a not-yet-started job when requested to be cancelled and store the cancel date. ([c28890d](https://github.com/teamstarter/graphql-node-jobs/commit/c28890ddf7f9e398f0742e9570918c6deeabfbd5))

### [0.3.6](https://github.com/teamstarter/graphql-node-jobs/compare/v0.3.5...v0.3.6) (2020-11-09)


### Bug Fixes

* **checkForJobs:** add the missing argument to checkforJobs when looping ([57c8f62](https://github.com/teamstarter/graphql-node-jobs/commit/57c8f628fd47d209b6c2ac4f949e0eb4129c7573))

### [0.3.5](https://github.com/teamstarter/graphql-node-jobs/compare/v0.3.4...v0.3.5) (2020-11-09)


### Features

* **cancel-request:** One can request an job cancelation ([ba64443](https://github.com/teamstarter/graphql-node-jobs/commit/ba644434b6202b96df60e9b70467f0ef678623f4))

### [0.3.4](https://github.com/teamstarter/graphql-node-jobs/compare/v0.3.3...v0.3.4) (2020-11-04)


### Bug Fixes

* **job:** Add missing subscriptions and remove hardcoded GSG types. ([cfd192a](https://github.com/teamstarter/graphql-node-jobs/commit/cfd192a7bd0ecc9a28783e5a445be83e59bb7d5b))

### [0.3.3](https://github.com/teamstarter/graphql-node-jobs/compare/v0.3.2...v0.3.3) (2020-11-04)


### Bug Fixes

* **graphql:** Fix count endpoint missing after GSG upgrade. ([6a50b03](https://github.com/teamstarter/graphql-node-jobs/commit/6a50b033837de03d97973271302c47011291d5b4))

### [0.3.2](https://github.com/teamstarter/graphql-node-jobs/compare/v0.3.1...v0.3.2) (2020-11-03)


### Bug Fixes

* **dependencies:** Fix unsync dependencies making the build fail. ([53e985f](https://github.com/teamstarter/graphql-node-jobs/commit/53e985fd209dd3d1427bd71741fb31c4a4304775))

### [0.3.1](https://github.com/teamstarter/graphql-node-jobs/compare/v0.3.0...v0.3.1) (2020-11-03)

## [0.3.0](https://github.com/teamstarter/graphql-node-jobs/compare/v0.2.3...v0.3.0) (2020-11-02)


### ⚠ BREAKING CHANGES

* upgrade sequelize to 6.3.5

* Merge pull request #11 from teamstarter/upgrade-sequelize ([27f440c](https://github.com/teamstarter/graphql-node-jobs/commit/27f440cf92b2c96c7cf9ad773a78a431ca0d3410)), closes [#11](https://github.com/teamstarter/graphql-node-jobs/issues/11)

### [0.2.3](https://github.com/teamstarter/graphql-node-jobs/compare/v0.2.2...v0.2.3) (2020-04-19)

### [0.2.2](https://github.com/teamstarter/graphql-node-jobs/compare/v0.2.1...v0.2.2) (2020-04-02)


### Features

* **server:** Allow to provide custom mutations. ([1c54af8](https://github.com/teamstarter/graphql-node-jobs/commit/1c54af820a5362536af427f8b9e8cd043d3d8bc2))

### [0.2.1](https://github.com/teamstarter/graphql-node-jobs/compare/v0.2.0...v0.2.1) (2020-03-24)


### Features

* **worker:** List jobs now directly returns the jobs. ([52381ac](https://github.com/teamstarter/graphql-node-jobs/commit/52381ac78034d9f6f4ba71e8a32c1950bf7760fa))

## [0.2.0](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.27...v0.2.0) (2020-03-24)


### ⚠ BREAKING CHANGES

* **worker:** The worker functions now use an ApolloClient and not an uri.

### Features

* **worker:** Provide a function to create Job ([9134c65](https://github.com/teamstarter/graphql-node-jobs/commit/9134c652db646798f16cc77f95971b5183aa74fa))

### [0.1.27](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.26...v0.1.27) (2020-03-24)


### Features

* **job:** Allow to planify a job in the future. ([c665902](https://github.com/teamstarter/graphql-node-jobs/commit/c66590273c7a5c12d96718f4e51d19809d5e4933))
* **worker:** Provide a method to fetch jobs. ([b299d8e](https://github.com/teamstarter/graphql-node-jobs/commit/b299d8e82abb2bab97d32f8bd54e9db587bbf760))

### [0.1.26](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.25...v0.1.26) (2020-02-10)


### Bug Fixes

* **migration:** Make the migration work for postgres and sqlite. ([cf6ba54](https://github.com/teamstarter/graphql-node-jobs/commit/cf6ba54e50fcbeeefc6d9e78d84e24c249b3153f))

### [0.1.25](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.24...v0.1.25) (2020-02-10)


### Features

* **job:** update job type to allow querying it. ([c55f6e1](https://github.com/teamstarter/graphql-node-jobs/commit/c55f6e1844a2a6f367cd9fb6a8b4ea179fefd1e1))

### [0.1.24](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.23...v0.1.24) (2020-01-18)


### Features

* **job:** Add the processing info. ([dc6caeb](https://github.com/teamstarter/graphql-node-jobs/commit/dc6caeb4b98b4f8dcc8325c4a016fd28379ecfa2))

### [0.1.23](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.22...v0.1.23) (2020-01-06)

### [0.1.22](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.21...v0.1.22) (2020-01-06)


### Bug Fixes

* **worker:** Do not presume a stack is available. ([1f69a33](https://github.com/teamstarter/graphql-node-jobs/commit/1f69a3327e61419a643b8d767225c21a1d3c702b))

### [0.1.21](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.20...v0.1.21) (2020-01-03)


### Features

* **server:** Allow to customize the gsg call. ([f91afd9](https://github.com/teamstarter/graphql-node-jobs/commit/f91afd92ff61f03df126b7a7a35507ab120fac03))

### [0.1.20](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.19...v0.1.20) (2020-01-03)


### Bug Fixes

* **job:** Allow to store more text in input and output fields. BC commit but ok for now. ([490e9fc](https://github.com/teamstarter/graphql-node-jobs/commit/490e9fc52ad43662c6f7abdee27c03890f60ab5b))

### [0.1.19](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.18...v0.1.19) (2020-01-03)


### Features

* **checkForJobs:** Add stack trace in case of error. ([4d56710](https://github.com/teamstarter/graphql-node-jobs/commit/4d56710dc61100d4a7eb885faf7c73433f46bc9a))

### [0.1.18](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.17...v0.1.18) (2020-01-03)


### Features

* **checkForJob:** Handle the failed status automatically. ([e248c53](https://github.com/teamstarter/graphql-node-jobs/commit/e248c53b83a8e62d80958a9c39f59ae2a5d02d3d))

### [0.1.17](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.16...v0.1.17) (2020-01-02)


### Bug Fixes

* **job:** Fix start and end date. ([d83dcd7](https://github.com/teamstarter/graphql-node-jobs/commit/d83dcd7daafc6cdc9e9728781ee69f746ad601d1))

### [0.1.16](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.15...v0.1.16) (2020-01-02)


### Features

* **job:** Track the execution time. ([fa709f9](https://github.com/teamstarter/graphql-node-jobs/commit/fa709f969be9efb8af12c4adda227c416d3e4b59))

### [0.1.15](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.14...v0.1.15) (2019-12-29)


### Bug Fixes

* checkForJobs looping ([b8fd8a3](https://github.com/teamstarter/graphql-node-jobs/commit/b8fd8a3a136d693ebcd73579b4e59eeb34a9d162))

### [0.1.14](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.13...v0.1.14) (2019-12-28)


### Bug Fixes

* Fix checkForJobs compatibility with nodejs. ([00361de](https://github.com/teamstarter/graphql-node-jobs/commit/00361defc12a6b404910f2f4e8a0181884ab0340))

### [0.1.13](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.12...v0.1.13) (2019-12-28)


### Features

* Add a simple worker ([5e9d510](https://github.com/teamstarter/graphql-node-jobs/commit/5e9d510afbbe381cbe767e8a1698448b3c092107))
* The CI is setup. ([8fbc4ed](https://github.com/teamstarter/graphql-node-jobs/commit/8fbc4ed47f55dfc5f91b94080a7d069b9c3dcf84))

### [0.1.12](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.11...v0.1.12) (2019-12-27)


### Features

* Add a first test to setup the CI. ([20a62f5](https://github.com/teamstarter/graphql-node-jobs/commit/20a62f53115817499be05ac946ea49533250f9ca))

### [0.1.11](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.10...v0.1.11) (2019-12-27)


### Features

* Make the migrations use a different schema. ([ba8d078](https://github.com/teamstarter/graphql-node-jobs/commit/ba8d0788035f11f7425dec20fed95e45594028bf))

### [0.1.10](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.9...v0.1.10) (2019-12-27)


### Features

* **CLI:** Add a test server. ([9d90423](https://github.com/teamstarter/graphql-node-jobs/commit/9d90423e8721ed02a6f578cd8ae312736d82d485))

### [0.1.9](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.8...v0.1.9) (2019-12-27)


### Features

* **api:** Add basic mutations for models. ([a68e39c](https://github.com/teamstarter/graphql-node-jobs/commit/a68e39c3b6732283137bfdb0c96daec2218017e5))

### [0.1.8](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.7...v0.1.8) (2019-12-27)


### Bug Fixes

* **CLI:** Add the migrations to the build. ([a98d960](https://github.com/teamstarter/graphql-node-jobs/commit/a98d96034d663ac10ae361b7109019911a7cca5e))

### [0.1.7](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.6...v0.1.7) (2019-12-27)


### Bug Fixes

* **CLI:** Make cli invoquable without calling node and improve error management. ([c2fd37d](https://github.com/teamstarter/graphql-node-jobs/commit/c2fd37d91a763eebe7dab0c7d8fc2689662b505e))

### [0.1.6](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.5...v0.1.6) (2019-12-27)

### [0.1.5](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.4...v0.1.5) (2019-12-27)


### Bug Fixes

* **cli:** Fix bin path. ([4466aa5](https://github.com/teamstarter/graphql-node-jobs/commit/4466aa51d6d053638de031b657e18a1bdedd8ec2))

### [0.1.4](https://github.com/teamstarter/graphql-node-jobs/compare/v0.1.3...v0.1.4) (2019-12-27)


### Features

* **migration:** Add a migration cli. ([bee5d81](https://github.com/teamstarter/graphql-node-jobs/commit/bee5d8131682edadc31ed234873076377a309d4c))

### [0.1.3](https://github.com/teamstarter/node-jobs/compare/v0.1.2...v0.1.3) (2019-12-26)


### Bug Fixes

* Add missing files to the build ([d77ffbb](https://github.com/teamstarter/node-jobs/commit/d77ffbb4e472ecf3e0b1c8a368520be7215afc1d))

### [0.1.2](https://github.com/teamstarter/node-jobs/compare/v0.1.1...v0.1.2) (2019-12-26)


### Features

* Change project name as npm slot is taken. ([b789f15](https://github.com/teamstarter/node-jobs/commit/b789f156d3fcca1542ee287ce11f11efaa94399a))


### Bug Fixes

* Try to fix relative path. ([665206c](https://github.com/teamstarter/node-jobs/commit/665206c456b2926795b7b29d74cf5b3880b4cfab))

### 0.1.1 (2019-12-26)


### Features

* Start to expose standard functions to check package usability. ([9e82278](https://github.com/teamstarter/node-jobs/commit/9e8227833b1018ba47e1e6edabea0469d107d5f0))
