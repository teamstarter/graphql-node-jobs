import path from 'path'
import fs from 'fs'
import Umzug from 'umzug'
import { SequelizeModels } from '@teamstarter/graphql-sequelize-generator/types'

/**
 * This file handles an im-memory SQLite database used for test purposes.
 * It exports three functions:
 * - migrateDatabase: generates the database from the migrations files
 * - seedDatabase: seeds the database from the seeders files
 * - deleteTables: delete all the tables
 * It also exports sequelize models.
 * - models
 */

/**
 * Seeds the database with mockup data
 */
export default async (models: SequelizeModels) => {
  const sequelize = models.sequelize // sequelize is the instance of the db

  const umzugOptions = (path: string) => ({
    storage: 'sequelize',
    storageOptions: {
      sequelize,
      tableName: 'gnj_sequelize_meta',
    },
    migrations: {
      params: [
        sequelize.getQueryInterface(), // queryInterface
        sequelize.constructor, // DataTypes
        () => {
          throw new Error(
            'technical|Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.'
          )
        },
      ],
      path,
      pattern: /\.js$/,
    },
  })

  // Array containing the filenames of the seeders files without extensions, sorted chronologically.
  const functionFiles = fs
    .readdirSync(path.join(__dirname, '/../migrations'))
    .sort()
    .map((f: any) => path.basename(f, '.js'))

  const functions = new Umzug(
    umzugOptions(path.join(__dirname, '/../migrations'))
  )

  await functions.up({
    migrations: functionFiles,
  })
}
