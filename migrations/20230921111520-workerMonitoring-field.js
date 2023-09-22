module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('workerMonitoring', 'workerType', {
      type: Sequelize.STRING,
      allowNull: false,
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('workerMonitoring', 'workerType')
  },
}
