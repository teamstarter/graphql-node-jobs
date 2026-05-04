module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('job', 'priorityLevel', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 4,
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('job', 'priorityLevel')
  },
}
