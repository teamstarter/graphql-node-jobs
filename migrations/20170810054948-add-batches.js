'use strict'

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('batch', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      pipelineId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'pipeline',
          key: 'id',
          onDelete: 'cascade',
          onUpdate: 'cascade'
        },
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },
  down: function(queryInterface) {
    return queryInterface.dropTable('batch')
  }
}
