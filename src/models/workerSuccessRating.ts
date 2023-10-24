import { DataTypes } from 'sequelize'
// This is a view
export default function workerSuccessRating(sequelize: any) {
  const WorkerSuccessRating = sequelize.define(
    'workerSuccessRating',
    {
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      workerType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      availableRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      processingRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      failedRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      exitedRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  )
  return WorkerSuccessRating
}
