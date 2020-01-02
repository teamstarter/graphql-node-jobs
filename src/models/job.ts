import { DataTypes } from 'sequelize'

export default function Job(sequelize: any) {
  const Job = sequelize.define(
    'job',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING
      },
      input: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      output: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'queued',
        validate: {
          isIn: [
            [
              'planned', // Job inside a batch or a pipeline. Waits to be moved to queued.˜
              'queued', // default state for a new job without batch or pipeline
              'processing',
              'failed',
              'successful',
              'cancelled'
            ]
          ]
        }
      },
      batchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      workerId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
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
