module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('job', {
      fields: ['id'],
      name: 'index_on_id',
    })

    await queryInterface.addIndex('job', {
      fields: ['type'],
      name: 'index_on_type',
    })

    await queryInterface.addIndex('job', {
      fields: ['status'],
      name: 'index_on_status',
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('job', 'index_on_id')
    await queryInterface.removeIndex('job', 'index_on_type')
    await queryInterface.removeIndex('job', 'index_on_status')
  },
}
