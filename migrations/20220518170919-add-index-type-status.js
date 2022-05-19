module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addIndex('job', ['type', 'status'], {
      where: { deletedAt: null },
      name: 'idx_job_type_status',
    })
  },

  down: async function (queryInterface) {
    await queryInterface.removeIndex('job', 'idx_job_type_status')
  },
}
