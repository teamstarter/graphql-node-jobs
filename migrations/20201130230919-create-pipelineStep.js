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
        allowNull: true,
      },
      batchId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      pipelineId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      index: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    })
  },
  down: function (queryInterface) {
    return queryInterface.dropTable('pipelineStep')
  },
}
