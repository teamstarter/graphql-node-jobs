module.exports = {
  development: {
    dialect: 'sqlite',
    storage: 'data/main.db',
    logging: false, // console.log
  },
  production: {
    dialect: 'sqlite',
    storage: 'data/main.db',
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
}
