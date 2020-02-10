module.exports = {
  up: async function(queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.changeColumn('job', 'input', {
        type: 'JSON USING CAST("input" as JSON)',
        allowNull: true,
        defaultValue: null
      })
      await queryInterface.changeColumn('job', 'output', {
        type: 'JSON USING CAST("output" as JSON)',
        allowNull: true,
        defaultValue: null
      })
    } else {
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
    }
  },

  down: async function(queryInterface) {
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.changeColumn('job', 'input', {
        type: 'TEXT USING CAST("input" as TEXT)',
        allowNull: true,
        defaultValue: null
      })
      await queryInterface.changeColumn('job', 'output', {
        type: 'TEXT USING CAST("output" as TEXT)',
        allowNull: true,
        defaultValue: null
      })
    } else {
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
}
