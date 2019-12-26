import Sequelize from 'sequelize'

export default function Pipeline(sequelize: any) {
  var Pipeline = sequelize.define(
    'pipeline',
    {
      name: {
        type: Sequelize.STRING
      },
      metadata: {
        type: Sequelize.STRING
      }
    },
    {
      freezeTableName: true,
      tableName: 'pipeline'
    }
  )
  Pipeline.associate = function(models: any) {
    models.pipeline.hasMany(models.batch, {
      as: 'batches',
      foreignKey: 'pipelineId',
      sourceKey: 'id'
    })
  }
  return Pipeline
}
