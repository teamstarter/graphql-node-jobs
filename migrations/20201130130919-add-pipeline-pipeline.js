'use strict'
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('pipeline', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'queued',
    })
  },
  down: function (queryInterface) {
    return queryInterface.dropTable('pipeline', 'status')
  },
}
