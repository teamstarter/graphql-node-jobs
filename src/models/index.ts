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
function initDb(config: any) {
  const basename = path.basename(module.filename)
  db = {}

  let sequelize: any = null

  if (
    typeof config.use_env_variable !== 'undefined' &&
    config.use_env_variable
  ) {
    sequelize = new Sequelize()
  } else {
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    )
  }

  fs.readdirSync(__dirname)
    .filter(function(file) {
      return (
        file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
      )
    })
    .forEach(function(file) {
      var model = sequelize['import'](path.join(__dirname, file))
      db[model.name] = model
    })

  Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
      db[modelName].associate(db)
    }
  })

  db.sequelize = sequelize
  db.Sequelize = Sequelize
}

export default function getModels(dbConfig: any) {
  if (!db) {
    initDb(dbConfig)
  }
  return db
}
