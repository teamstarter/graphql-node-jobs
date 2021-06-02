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
        allowNull: true,
        defaultValue: null,
      },
      batchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      pipelineId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      index: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    models.pipelineStep.belongsTo(models.batch, {
      foreignKey: 'batchId',
      sourceKey: 'id',
    })
    models.pipelineStep.belongsTo(models.job, {
      foreignKey: 'jobId',
      sourceKey: 'id',
    })
  }

  return PipelineStep
}
