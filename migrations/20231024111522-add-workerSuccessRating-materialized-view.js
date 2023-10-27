module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "pgcrypto";'
    )

    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS "workerSuccessRating" as
      SELECT
          gen_random_uuid() as "uuid",
          wm."workerType" as "workerType",
          TO_CHAR(DATE_TRUNC('hour', wm."createdAt"), 'HH24 YYYY/MM/DD') AS "timestamp",
          ROUND(
                  (SUM(CASE WHEN wm."workerStatus" = 'AVAILABLE' THEN 1 ELSE 0 END) * 100.0) / COUNT(*)
              )::INTEGER AS "availableRating",
          ROUND(
                  (SUM(CASE WHEN wm."workerStatus" = 'PROCESSING' THEN 1 ELSE 0 END) * 100.0) / COUNT(*)
              )::INTEGER AS "processingRating",
          ROUND(
              (SUM(CASE WHEN wm."workerStatus" = 'FAILED' THEN 1 ELSE 0 END) * 100.0) / COUNT(*)
          )::INTEGER AS "failedRating",
          ROUND(
              (SUM(CASE WHEN wm."workerStatus" = 'EXITED' THEN 1 ELSE 0 END) * 100.0) / COUNT(*)
          )::INTEGER AS "exitedRating"
      FROM "workerMonitoring" wm
      GROUP BY DATE_TRUNC('hour', wm."createdAt"), TO_CHAR(DATE_TRUNC('hour', wm."createdAt"), 'HH24 YYYY/MM/DD'), wm."workerType"
      ORDER BY DATE_TRUNC('hour', wm."createdAt") DESC
      LIMIT 360;`)
  },
  down: async function () {
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS "pgcrypto";')
  },
}
