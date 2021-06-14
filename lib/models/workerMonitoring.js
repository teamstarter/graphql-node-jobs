"use strict";
exports.__esModule = true;
var sequelize_1 = require("sequelize");
function WorkerMonitoring(sequelize) {
    var WorkerMonitoring = sequelize.define('workerMonitoring', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        workerId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        lastCalledAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
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
        tableName: 'workerMonitoring',
        paranoid: true
    });
    return WorkerMonitoring;
}
exports["default"] = WorkerMonitoring;
