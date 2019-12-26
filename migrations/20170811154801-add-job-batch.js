'use strict'

module.exports = {
  up: function(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('job', 'batchId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'batch',
          key: 'id',
          onDelete: 'cascade',
          onUpdate: 'cascade'
        }
      })
    ])
  },

  down: function() {}
}
