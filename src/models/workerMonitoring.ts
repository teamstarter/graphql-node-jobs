import { DataTypes } from 'sequelize'

export default function WorkerMonitoring(sequelize: any) {
  var WorkerMonitoring = sequelize.define(
    'workerMonitoring',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      workerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      workerType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      workerStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      freezeTableName: true,
      tableName: 'workerMonitoring',
      paranoid: true,
    }
  )
  return WorkerMonitoring
}
