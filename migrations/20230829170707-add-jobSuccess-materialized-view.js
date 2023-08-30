const sequelize = require('sequelize')

module.exports = {
  up: async function (queryInterface, Sequelize) {
    sequelize.queryInterface.query(`
	CREATE MATERIALIZED VIEW IF NOT EXISTS "jobSuccess" as
	SELECT
    	TO_CHAR(DATE_TRUNC('day', j."createdAt"), 'DD/MM/YY') AS "day",
    	ROUND(
        	(SUM(CASE WHEN j."status" = 'successful' THEN 1 ELSE 0 END) * 100.0) /
        	NULLIF(SUM(CASE WHEN j."status" IN ('successful', 'failed') THEN 1 ELSE 0 END), 0)
    	)::INTEGER AS "successRating"
	FROM
    	job j
	WHERE
    	j."status" IN ('successful', 'failed')
	GROUP BY
    	DATE_TRUNC('day', j."createdAt")
	ORDER BY
    	DATE_TRUNC('day', j."createdAt");`)
  },
  down: function () {},
}
