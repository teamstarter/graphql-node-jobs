module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('pipelineStep', 'status', {
      type: Sequelize.STRING,
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeColumn('pipelineStep', 'status')
  },
}
