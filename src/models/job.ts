import Sequelize from 'sequelize'

export default function Job(sequelize: any) {
  const Job = sequelize.define(
    'job',
    {
      type: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      input: {
        type: Sequelize.STRING
      },
      output: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      batchId: {
        type: Sequelize.INTEGER
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
