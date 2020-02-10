module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.changeColumn('job', 'input', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null
    })
    await queryInterface.changeColumn('job', 'output', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null
    })
  },

  down: async function(queryInterface) {
    await queryInterface.changeColumn('job', 'input', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    })
    await queryInterface.changeColumn('job', 'output', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    })
  }
}
