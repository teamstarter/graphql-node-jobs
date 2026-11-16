module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('job', 'interruptedCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('job', 'interruptedCount')
  },
}
