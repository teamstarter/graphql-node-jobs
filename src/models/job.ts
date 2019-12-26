import { DataTypes } from 'sequelize'

export default function Job(sequelize: any) {
  const Job = sequelize.define(
    'job',
    {
      type: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING
      },
      input: {
        type: DataTypes.STRING
      },
      output: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.STRING
      },
      batchId: {
        type: DataTypes.INTEGER
      }
    },
    {
      freezeTableName: true,
      tableName: 'job'
    }
  )
  Job.associate = function(models: any) {
    models.job.belongsTo(models.batch, {
      foreignKey: 'batchId',
      sourceKey: 'id'
    })
  }
  return Job
}
