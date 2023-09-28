module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('workerMonitoring', 'workerStatus', {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('workerMonitoring', 'workerStatus')
  },
}
