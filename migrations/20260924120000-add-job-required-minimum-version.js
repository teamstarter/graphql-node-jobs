module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('job', 'requiredMinimumVersion', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('job', 'requiredMinimumVersion')
  },
}
