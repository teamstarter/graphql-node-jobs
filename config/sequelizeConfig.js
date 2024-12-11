const dotenv = require('dotenv')
const debug = require('debug')('sql')
const { DataTypes } = require('sequelize')

// Load environment variables from the .env file
dotenv.config()

debug(
  'Sequelize config loading with database: ',
  process.env.PGDATABASE,
  process.env.PGHOST
)

module.exports = {
  development: {
    dialect: 'postgres',
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    logging: console.log,
    migrationStorageTableSchema: 'public',
    database: process.env.PGDATABASE,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  },
  test: {
    dialect: 'postgres',
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    logging: false,
    migrationStorageTableSchema: 'public',
    database: `${process.env.PGDATABASE}`,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  },
}
