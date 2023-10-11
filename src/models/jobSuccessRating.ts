import { DataTypes } from 'sequelize'
// This is a view
export default function JobSuccessRating(sequelize: any) {
  const JobSuccessRating = sequelize.define(
    'jobSuccessRating',
    {
      day: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      successRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      successfulJobs: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      failedJobs: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalJobs: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  )
  JobSuccessRating.removeAttribute('id')
  return JobSuccessRating
}
