import { DataTypes } from 'sequelize'

export default function Pipeline(sequelize: any) {
  var Pipeline = sequelize.define(
    'pipeline',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      metadata: {
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true,
      tableName: 'pipeline',
      paranoid: true,
    }
  )
  Pipeline.associate = function (models: any) {
    models.pipeline.hasMany(models.batch, {
      as: 'batches',
      foreignKey: 'pipelineId',
      sourceKey: 'id',
    })
  }
  return Pipeline
}
