module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('pipeline', 'status', {
      type: Sequelize.STRING,
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('pipeline', 'status')
  },
}
