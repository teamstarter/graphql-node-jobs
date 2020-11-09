module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('job', 'processingInfo', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('job', 'processingInfo')
  },
}
