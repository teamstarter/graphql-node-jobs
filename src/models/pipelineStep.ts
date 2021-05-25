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
      index: {
        type: DataTypes.INTEGER,
      },
    },
    {
      freezeTableName: true,
      tableName: 'pipelineStep',
      paranoid: true,
    }
  )
  return PipelineStep
}
