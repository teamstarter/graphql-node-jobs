module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'job',
      'isUpdateAlreadyCalledWhileCancelRequested',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    )
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn(
      'job',
      'isUpdateAlreadyCalledWhileCancelRequested'
    )
  },
}
