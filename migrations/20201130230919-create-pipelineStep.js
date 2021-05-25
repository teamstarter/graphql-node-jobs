'use strict'
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('pipelineStep', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      jobId: {
        type: Sequelize.INTEGER,
      },
      batchId: {
        type: Sequelize.INTEGER,
      },
      index: {
        type: Sequelize.INTEGER,
      },
    })
  },
  down: function (queryInterface) {
    return queryInterface.dropTable('pipelineStep')
  },
}
