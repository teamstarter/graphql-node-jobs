import program from 'commander'
import migrate from './migrate'
import getModels from './models'

program
  .command('migrate <configPath>')
  .description(
    'Migrate the database with the last schema of graphql-node-jobs. We advise to provide a separated schema.'
  )
  .action(async function(configPath) {
    let config = null
    try {
      config = require(configPath)
    } catch (e) {
      console.log('Could not load the given config.', e)
    }
    const models = getModels(config)
    await migrate(models)
  })

program.command('help', 'Display the help')

program.parse(process.argv)
