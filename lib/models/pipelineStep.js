"use strict";
exports.__esModule = true;
var sequelize_1 = require("sequelize");
function PipelineStep(sequelize) {
    var PipelineStep = sequelize.define('pipelineStep', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        jobId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        batchId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        pipelineId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        index: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: 'planned',
            validate: {
                isIn: [['planned', 'done']]
            }
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
        tableName: 'pipelineStep',
        paranoid: true
    });
    PipelineStep.associate = function (models) {
        models.pipelineStep.belongsTo(models.pipeline, {
            foreignKey: 'pipelineId',
            sourceKey: 'id'
        });
    };
    return PipelineStep;
}
exports["default"] = PipelineStep;
