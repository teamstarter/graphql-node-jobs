#!/usr/bin/env node

import program from 'commander'
import migrate from './migrate'
import getModels from './models'
import { generateJobs } from './scripts/generateJobs'
import { generateWorkersLogs } from './scripts/generateWorkersLogs'

program
  .command('migrate <configPath>')
  .option(
    '-d --dbhash <dbhash>',
    'The database hash in case of shared database'
  )
  .description(
    'Migrate the database with the last schema of graphql-node-jobs. We advise to provide a separated schema.'
  )
  .action(async function (configPath, options) {
    let config = null
    try {
      config = require(configPath)
    } catch (e: any) {
      throw new Error('Could not load the given config.' + e.message)
    }

    const models = await getModels(config, options ? options.dbhash : null)
    await migrate(models)
    await models.sequelize.close()
  })

program
  .command('seedJobs <configPath> <nbDays> <nbJobsPerDay>')
  .description('Seed the job table')
  .action(async function (configPath, nbDays, nbJobsPerDay) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('This command is only available in development mode')
    }
    let config = null
    try {
      config = require(configPath)
    } catch (e: any) {
      throw new Error('Could not load the given config.' + e.message)
    }
    const models = await getModels(config, '')
    await generateJobs(models, nbDays, nbJobsPerDay)
    await models.sequelize.close()
    console.log('Seeding Done')
  })

program
  .command('seedWorkerLogs <configPath> <nbHours>')
  .description('Seed the workerMonitoring table')
  .action(async function (configPath, nbHours) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('This command is only available in development mode')
    }
    let config = null
    try {
      config = require(configPath)
    } catch (e: any) {
      throw new Error('Could not load the given config.' + e.message)
    }
    const models = await getModels(config, '')
    await generateWorkersLogs(models, nbHours)
    await models.sequelize.close()
    console.log('Seeding Done')
  })

program.command('help', 'Display the help')

program.parse(process.argv)
