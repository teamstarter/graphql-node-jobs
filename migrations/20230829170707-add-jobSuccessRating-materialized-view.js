module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
	CREATE MATERIALIZED VIEW IF NOT EXISTS "jobSuccessRating" as
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
  down: function () {},
}
