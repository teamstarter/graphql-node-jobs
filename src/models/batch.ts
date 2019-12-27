import { DataTypes } from 'sequelize'

export default function Batch(sequelize: any) {
  var Batch = sequelize.define(
    'batch',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      status: {
        type: DataTypes.STRING
      },
      pipelineId: {
        type: DataTypes.INTEGER
      }
    },
    {
      freezeTableName: true,
      tableName: 'batch'
    }
  )

  Batch.associate = function(models: any) {
    models.batch.belongsTo(models.pipeline, {
      foreignKey: 'pipelineId',
      sourceKey: 'id'
    })
    models.batch.hasMany(models.job, {
      as: 'jobs',
      foreignKey: 'batchId',
      sourceKey: 'id'
    })
  }
  return Batch
}
