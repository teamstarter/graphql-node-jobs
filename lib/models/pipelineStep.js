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
            type: sequelize_1.DataTypes.INTEGER
        },
        batchId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        index: {
            type: sequelize_1.DataTypes.INTEGER
        }
    }, {
        freezeTableName: true,
        tableName: 'pipelineStep',
        paranoid: true
    });
    return PipelineStep;
}
exports["default"] = PipelineStep;
