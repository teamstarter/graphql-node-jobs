import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'

let db = null

/**
 * In a standard project the configuration is a commited file. But here
 * you can specify it if needed. So we have to expose a getter that caches
 * the models.
 *
 * It must be noted that NJ does not support changing the models configuration
 * once the models are fetched.
 */
function initDb(config) {
  const basename = path.basename(module.filename)
  db = {}
  config.operatorsAliases = operatorsAliases

  let sequelize = config.use_env_variable
    ? new Sequelize(process.env[config.use_env_variable])
    : new Sequelize(config.database, config.username, config.password, config)

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

export default function getModels(dbConfig) {
  if (!db) {
    initDb(dbConfig)
  }
  return db
}
