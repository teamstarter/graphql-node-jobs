module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('workerMonitoring', 'lastCalledAt')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('workerMonitoring', 'lastCalledAt', {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    })
  },
}
