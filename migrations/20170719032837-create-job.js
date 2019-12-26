'use strict'
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('job', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      input: {
        type: Sequelize.STRING
      },
      output: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('job')
  }
}
