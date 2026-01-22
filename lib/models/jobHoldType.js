"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = jobHoldType;
var sequelize_1 = require("sequelize");
function jobHoldType(sequelize) {
    var jobHoldType = sequelize.define('jobHoldType', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
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
        tableName: 'jobHoldType',
        paranoid: true,
    });
    return jobHoldType;
}
