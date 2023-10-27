const path = require('path')
const fs = require('fs')
const Umzug = require('umzug')
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
} = require('graphql')

const { getStandAloneServer, getModels } = require('./../lib/index')

var dbConfig = require(path.join(__dirname, '/sqliteTestConfig.js')).test

/**
 * This file handles an im-memory SQLite database used for test purposes.
 * It exports three functions:
 * - migrateDatabase: generates the database from the migrations files
 * - seedDatabase: seeds the database from the seeders files
 * - deleteTables: delete all the tables
 * It also exports sequelize models.
 * - models
 */

// Array containing the filenames of the migrations files without extensions, sorted chronologically.
let migrationFiles = fs
  .readdirSync('./migrations/')
  .sort()
  .map((f) => path.basename(f, '.js'))
if (process.env.NODE_ENV === 'test') {
  migrationFiles = migrationFiles.filter(
    (f) =>
      f !== '20230829170707-add-jobSuccessRating-materialized-view' &&
      f !== '20231024111522-add-workerSuccessRating-materialized-view'
  )
}
// Array containing the filenames of the seeders files without extensions, sorted chronologically.
const seederFiles = fs
  .readdirSync('./seeders/')
  .sort()
  .map((f) => path.basename(f, '.js'))

/**
 * Migrates the database
 */
exports.migrateDatabase = async () => {
  const models = await getModels(dbConfig)
  const sequelize = models.sequelize // sequelize is the instance of the db

  /**
   * Generates options for umzug. `path` indicates where to find the migrations or seeders (either in ./migrations or ./seeders).
   * Returns a JS plain Object with the correct options, ready to feed `new Umzug(...)`.
   */
  const umzugOptions = (path) => ({
    storage: 'sequelize',
    storageOptions: {
      sequelize,
    },
    migrations: {
      params: [
        sequelize.getQueryInterface(), // queryInterface
        sequelize.constructor, // DataTypes
        function () {
          throw new Error(
            'Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.'
          )
        },
      ],
      path,
      pattern: /\.js$/,
    },
  })

  const umzugMigrations = new Umzug(umzugOptions('./migrations'))

  return umzugMigrations.up({
    migrations: migrationFiles,
  })
}

/**
 * Seeds the database with mockup data
 */
exports.seedDatabase = async () => {
  const models = await getModels(dbConfig)
  const sequelize = models.sequelize // sequelize is the instance of the db

  /**
   * Generates options for umzug. `path` indicates where to find the migrations or seeders (either in ./migrations or ./seeders).
   * Returns a JS plain Object with the correct options, ready to feed `new Umzug(...)`.
   */
  const umzugOptions = (path) => ({
    storage: 'sequelize',
    storageOptions: {
      sequelize,
    },
    migrations: {
      params: [
        sequelize.getQueryInterface(), // queryInterface
        sequelize.constructor, // DataTypes
        function () {
          throw new Error(
            'Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.'
          )
        },
      ],
      path,
      pattern: /\.js$/,
    },
  })

  // Instances of Umzug for migrations and seeders
  const umzugSeeders = new Umzug(umzugOptions('./seeders'))

  return umzugSeeders.up({
    migrations: seederFiles,
  })
}

/**
 * Deletes all the tables
 */
exports.deleteTables = async () => {
  const models = await exports.getModels()
  const sequelize = models.sequelize

  await sequelize.getQueryInterface().dropAllTables()
}

exports.resetDatabase = async () => {
  try {
    await exports.migrateDatabase()
    await exports.seedDatabase()
  } catch (e) {
    console.log('Critical error during the database migration', e.message, e)
    throw e
  }
}

exports.getModels = async () => {
  return await getModels(dbConfig)
}

async function closeConnections() {
  const models = await exports.getModels()
  await models.sequelize.close()
}

exports.closeEverything = async (mainServer, models, done) => {
  await new Promise((resolve) => mainServer.close(() => resolve()))
  await closeConnections(models)
  done()
}

exports.getNewServer = (onJobFail) => {
  return getStandAloneServer(
    dbConfig,
    {
      apolloServerOptions: {
        playground: true,
        tracing: false,
        csrfPrevention: false,
      },
    },
    // You can add custom mutations if needed
    {
      customAcquire: {
        type: new GraphQLObjectType({
          name: 'customAcquire',
          fields: {
            id: { type: GraphQLInt },
          },
        }),
        args: {
          typeList: {
            type: new GraphQLList(GraphQLString),
          },
        },
        resolve: async (source, args, context) => {
          const models = await exports.getModels()
          // GNJ models can be retreived with the dbConfig if needed
          // const models = getModels(dbConfig)
          // get a job from the db
          const job = await models.job.findByPk(1)

          return job
        },
      },
    },
    onJobFail
  )
}
