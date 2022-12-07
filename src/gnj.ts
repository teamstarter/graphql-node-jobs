#!/usr/bin/env node

import program from 'commander'
import migrate from './migrate'
import getModels from './models'

program
  .command('migrate <configPath> <dbhash>')
  .description(
    'Migrate the database with the last schema of graphql-node-jobs. We advise to provide a separated schema.'
  )
  .action(async function (configPath, dbhash) {
    let config = null
    try {
      config = require(configPath)
    } catch (e: any) {
      throw new Error('Could not load the given config.' + e.message)
    }
    debugger
    const models = await getModels(config, dbhash)
    await migrate(models)
    await models.sequelize.close()
  })

program.command('help', 'Display the help')

program.parse(process.argv)
