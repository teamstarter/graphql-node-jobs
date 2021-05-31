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
        references: {
          model: 'job',
          key: 'id',
        },
        allowNull: true,
      },
      batchId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'batch',
          key: 'id',
        },
        allowNull: true,
      },
      pipelineId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'pipeline',
          key: 'id',
        },
        allowNull: true,
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
