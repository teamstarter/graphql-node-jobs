module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('job', 'startedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    })
    await queryInterface.addColumn('job', 'endedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    })
    await queryInterface.addColumn('job', 'workerId', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('job', 'startedAt')
    await queryInterface.removeColumn('job', 'endedAt')
    await queryInterface.removeColumn('job', 'workerId')
  },
}
