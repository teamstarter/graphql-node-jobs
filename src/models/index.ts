import fs from 'fs'
import path from 'path'
import { Sequelize } from 'sequelize'

let db: any = null

function importModels(sequelizeInstance: typeof Sequelize) {
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
async function initDb(config: any, dbhash?: string) {
 
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
      sequelize = new Sequelize(connexion)
    } else {
      sequelize = new Sequelize(connexion)
    }
  }

  importModels(sequelize)
  
  return db
}

export async function getModelsAndInitializeDatabase(dbConfig: any, dbhash?: string) {
  if (!db) {
    await initDb(dbConfig, dbhash)
  }
  return db
}

export function getModels(dbConfig: any, sequelizeInstance: any) {
  if (!db) {
    if(!sequelizeInstance) {
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
