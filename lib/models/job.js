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
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: sequelize_1.DataTypes.STRING
        },
        input: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        output: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        processingInfo: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            defaultValue: null
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
                        'successful',
                        'cancelled'
                    ]
                ]
            }
        },
        batchId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        workerId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        startedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        endedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        }
    }, {
        freezeTableName: true,
        tableName: 'job',
        paranoid: true
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
