module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('job', 'retryOfJobId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('job', 'retryOfJobId')
  },
}
