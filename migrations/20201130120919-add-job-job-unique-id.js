module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('job', 'jobUniqueId', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('job', 'jobUniqueId')
  },
}
