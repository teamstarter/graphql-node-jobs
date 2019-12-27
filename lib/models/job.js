"use strict";
exports.__esModule = true;
var sequelize_1 = require("sequelize");
function Job(sequelize) {
    var Job = sequelize.define('job', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: sequelize_1.DataTypes.STRING
        },
        name: {
            type: sequelize_1.DataTypes.STRING
        },
        input: {
            type: sequelize_1.DataTypes.STRING
        },
        output: {
            type: sequelize_1.DataTypes.STRING
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: 'queued',
            validate: {
                isIn: [
                    [
                        'planned',
                        'queued',
                        'processing',
                        'failed',
                        'sucessful',
                        'cancelled'
                    ]
                ]
            }
        },
        batchId: {
            type: sequelize_1.DataTypes.INTEGER
        }
    }, {
        freezeTableName: true,
        tableName: 'job'
    });
    Job.associate = function (models) {
        models.job.belongsTo(models.batch, {
            foreignKey: 'batchId',
            sourceKey: 'id'
        });
    };
    return Job;
}
exports["default"] = Job;
