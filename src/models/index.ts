import fs from 'fs'
import path from 'path'
import { Sequelize } from 'sequelize'

let db: any = null
let initPromise: Promise<any> | null = null

function importModels(sequelizeInstance: Sequelize) {
  db = {}
  const basename = path.basename(module.filename)

  fs.readdirSync(__dirname)
    .filter(function (file) {
      return (
        file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
      )
    })
    .forEach(function (file) {
      const model = require(path.join(__dirname, file)).default(
        sequelizeInstance
      )
      db[model.name] = model
    })

  Object.keys(db).forEach(function (modelName) {
    if (db[modelName].associate) {
      db[modelName].associate(db)
    }
  })

  db.sequelize = sequelizeInstance
  db.Sequelize = Sequelize
}

/**
 * In a standard project the configuration is a commited file. But here
 * you can specify it if needed. So we have to expose a getter that caches
 * the models.
 *
 * It must be noted that NJ does not support changing the models configuration
 * once the models are fetched.
 */
async function initDb({
  dbConfig,
  sequelizeInstance,
  dbhash,
}: {
  dbConfig?: any
  sequelizeInstance?: Sequelize
  dbhash?: string
}) {
  db = {}
  if (
    dbConfig &&
    typeof dbConfig.use_env_variable !== 'undefined' &&
    dbConfig.use_env_variable &&
    !sequelizeInstance
  ) {
    if (dbhash) {
      throw new Error(
        'Configuration in env variables cannot be used in db hash mode.'
      )
    }
    sequelizeInstance = new Sequelize()
  } else if (dbConfig) {
    const connexion =
      process.env.NODE_ENV &&
      typeof dbConfig[process.env.NODE_ENV] !== 'undefined'
        ? dbConfig[process.env.NODE_ENV]
        : dbConfig

    if (dbhash) {
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
      sequelizeInstance = new Sequelize(connexion)
    } else {
      sequelizeInstance = new Sequelize(connexion)
    }
  }

  importModels(sequelizeInstance as Sequelize)
  return db
}

export async function getModelsAndInitializeDatabase({
  dbConfig,
  sequelizeInstance,
  dbhash,
}: {
  dbConfig?: any
  sequelizeInstance?: Sequelize
  dbhash?: string
}) {
  if (!db) {
    await initDb({ dbConfig, sequelizeInstance, dbhash })
  }
  return db
}

export function getModels(dbConfig: any, sequelizeInstance: any) {
  if (!db) {
    if (!sequelizeInstance) {
      if (
        typeof dbConfig.use_env_variable !== 'undefined' &&
        dbConfig.use_env_variable
      ) {
        sequelizeInstance = new Sequelize()
      } else {
        const connexion =
          process.env.NODE_ENV &&
          typeof dbConfig[process.env.NODE_ENV] !== 'undefined'
            ? dbConfig[process.env.NODE_ENV]
            : dbConfig

        sequelizeInstance = new Sequelize(connexion)
      }
    }

    importModels(sequelizeInstance)
  }
  return db
}
