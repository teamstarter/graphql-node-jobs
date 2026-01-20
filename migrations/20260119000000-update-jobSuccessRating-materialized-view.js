module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'DROP MATERIALIZED VIEW IF EXISTS "jobSuccessRating";'
    )

    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW "jobSuccessRating" as
      SELECT
          TO_CHAR(DATE_TRUNC('day', j."createdAt"), 'YYYY/MM/DD') AS "day",
          COALESCE(ROUND(
                  (SUM(CASE WHEN j."status" = 'successful' THEN 1 ELSE 0 END) * 100.0) /
                  NULLIF(SUM(CASE WHEN j."status" IN ('successful', 'failed') THEN 1 ELSE 0 END), 0)
          )::INTEGER, 1000) AS "successRating",
          SUM(CASE WHEN j."status" = 'successful' THEN 1 ELSE 0 END) AS "successfulJobs",
          SUM(CASE WHEN j."status" = 'failed' THEN 1 ELSE 0 END) AS "failedJobs",
          SUM(CASE WHEN j."status" IN ('successful', 'failed') THEN 1 ELSE 0 END) AS "totalJobs"
      FROM
          job j
      WHERE
          j."createdAt" > NOW() - INTERVAL '30 days'
      GROUP BY
          DATE_TRUNC('day', j."createdAt")
      ORDER BY
          DATE_TRUNC('day', j."createdAt") DESC;`)

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_job_created_at_desc_status ON job ("createdAt" DESC, "status");
    `)
  },
  down: async function (queryInterface) {
    await queryInterface.sequelize.query(
      'DROP MATERIALIZED VIEW IF EXISTS "jobSuccessRating";'
    )

    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW "jobSuccessRating" as
      SELECT
          TO_CHAR(DATE_TRUNC('day', j."createdAt"), 'YYYY/MM/DD') AS "day",
          COALESCE(ROUND(
              (SUM(CASE WHEN j."status" = 'successful' THEN 1 ELSE 0 END) * 100.0) /
              NULLIF(SUM(CASE WHEN j."status" IN ('successful', 'failed') THEN 1 ELSE 0 END), 0)
          )::INTEGER, 1000) AS "successRating",
          SUM(CASE WHEN j."status" = 'successful' THEN 1 ELSE 0 END) AS "successfulJobs",
          SUM(CASE WHEN j."status" = 'failed' THEN 1 ELSE 0 END) AS "failedJobs",
          SUM(CASE WHEN j."status" IN ('successful', 'failed') THEN 1 ELSE 0 END) AS "totalJobs"
      FROM
          job j
      GROUP BY
          DATE_TRUNC('day', j."createdAt")
      ORDER BY
          DATE_TRUNC('day', j."createdAt");`)
  },
}
