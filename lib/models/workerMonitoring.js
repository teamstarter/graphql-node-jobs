"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkerMonitoring;
var sequelize_1 = require("sequelize");
function WorkerMonitoring(sequelize) {
    var WorkerMonitoring = sequelize.define('workerMonitoring', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        workerId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        workerType: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        workerStatus: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    }, {
        freezeTableName: true,
        tableName: 'workerMonitoring',
        paranoid: true,
    });
    return WorkerMonitoring;
}
