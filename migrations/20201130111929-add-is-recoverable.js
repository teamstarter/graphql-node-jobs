module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('job', 'isRecoverable', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('job', 'isRecoverable')
  },
}
