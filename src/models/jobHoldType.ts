import { DataTypes } from 'sequelize'

export default function jobHoldType(sequelize: any) {
  const jobHoldType = sequelize.define(
    'jobHoldType',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: 'jobHoldType',
      paranoid: true,
    }
  )
  return jobHoldType
}
