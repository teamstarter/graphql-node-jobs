module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE INDEX idx_job_type_status ON public.job (type, status) where ("deletedAt" IS NULL)`
    )
  },

  down: async function (queryInterface) {
    await queryInterface.sequelize.query(
      `DROP INDEX public.idx_job_type_status`
    )
  },
}
