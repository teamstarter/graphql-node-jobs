module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableWorkerMonitoring = await queryInterface.describeTable(
      'workerMonitoring'
    )
    if (!tableWorkerMonitoring.workerStatus) {
      await queryInterface.addColumn('workerMonitoring', 'workerStatus', {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      })

      await queryInterface.bulkUpdate(
        'workerMonitoring',
        { workerStatus: 'deprecated' },
        { workerStatus: { [Sequelize.Op.is]: null } }
      )
    }

    if (!tableWorkerMonitoring.workerType) {
      await queryInterface.addColumn('workerMonitoring', 'workerType', {
        type: Sequelize.STRING,
        allowNull: true,
      })

      await queryInterface.bulkUpdate(
        'workerMonitoring',
        { workerType: 'deprecated' },
        { workerType: { [Sequelize.Op.is]: null } }
      )
    }

    await queryInterface.changeColumn('workerMonitoring', 'workerStatus', {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    })

    await queryInterface.changeColumn('workerMonitoring', 'workerType', {
      type: Sequelize.STRING,
      allowNull: false,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('workerMonitoring', 'workerStatus')
    await queryInterface.removeColumn('workerMonitoring', 'workerType')
  },
}
