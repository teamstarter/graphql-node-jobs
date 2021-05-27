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
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'planned',
        validate: {
          isIn: [['planned', 'processing', 'failed', 'successful']],
        },
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
    models.pipeline.hasMany(models.job, {
      as: 'jobs',
      foreignKey: 'pipelineId',
      sourceKey: 'id',
    })
    models.pipeline.hasMany(models.pipelineStep, {
      as: 'steps',
      foreignKey: 'pipelineId',
      sourceKey: 'id',
    })
  }
  return Pipeline
}
