import fs from 'fs'
import path from 'path'
import { Sequelize } from 'sequelize'

let db: any = null

/**
 * In a standard project the configuration is a commited file. But here
 * you can specify it if needed. So we have to expose a getter that caches
 * the models.
 *
 * It must be noted that NJ does not support changing the models configuration
 * once the models are fetched.
 */
async function initDb(config: any, dbhash?: string) {
  const basename = path.basename(module.filename)
  db = {}

  let sequelize: any = null

  if (
    typeof config.use_env_variable !== 'undefined' &&
    config.use_env_variable
  ) {
    if (dbhash) {
      throw new Error(
        'Configuration in env variables cannot be used in db hash mode.'
      )
    }
    sequelize = new Sequelize()
  } else {
    const connexion =
      process.env.NODE_ENV &&
      typeof config[process.env.NODE_ENV] !== 'undefined'
        ? config[process.env.NODE_ENV]
        : config
    if (dbhash) {
      console.log('DBHASH provided', dbhash, connexion)
      connexion.database = null
      const tmpConnexion = new Sequelize(
        `${connexion.dialect}://${connexion.username}:${connexion.password}@${connexion.host}:${connexion.port}/postgres`
      )
      try {
        const res = await tmpConnexion
          .getQueryInterface()
          .createDatabase(dbhash)
      } catch (e) {
        // Sadly the wrapper do not handle IF NOT EXISTS.
        console.log(e)
      }

      connexion.database = dbhash
      console.log(connexion)
      sequelize = new Sequelize(connexion)
    } else {
      sequelize = new Sequelize(connexion)
    }
  }

  fs.readdirSync(__dirname)
    .filter(function (file) {
      return (
        file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
      )
    })
    .forEach(function (file) {
      const model = require(path.join(__dirname, file)).default(
        sequelize,
        sequelize.DataTypes
      )
      db[model.name] = model
    })

  Object.keys(db).forEach(function (modelName) {
    if (db[modelName].associate) {
      db[modelName].associate(db)
    }
  })

  db.sequelize = sequelize
  db.Sequelize = Sequelize
}

export default async function getModels(dbConfig: any, dbhash?: string) {
  if (!db) {
    await initDb(dbConfig, dbhash)
  }
  return db
}
