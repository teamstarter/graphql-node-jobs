module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.addColumn('job', 'startAfter', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    })
  },

  down: async function(queryInterface) {
    await queryInterface.removeColumn('job', 'startAfter')
  }
}
