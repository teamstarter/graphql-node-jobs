module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('job', 'isHighFrequency', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('job', 'isHighFrequency')
  },
}
