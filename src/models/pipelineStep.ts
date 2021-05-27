import { DataTypes } from 'sequelize'

export default function PipelineStep(sequelize: any) {
  var PipelineStep = sequelize.define(
    'pipelineStep',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      jobId: {
        type: DataTypes.INTEGER,
      },
      batchId: {
        type: DataTypes.INTEGER,
      },
      pipelineId: {
        type: DataTypes.INTEGER,
      },
      index: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'planned',
        validate: {
          isIn: [['planned', 'done']],
        },
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
      tableName: 'pipelineStep',
      paranoid: true,
    }
  )
  PipelineStep.associate = function (models: any) {
    models.pipelineStep.belongsTo(models.pipeline, {
      foreignKey: 'pipelineId',
      sourceKey: 'id',
    })
  }

  return PipelineStep
}
