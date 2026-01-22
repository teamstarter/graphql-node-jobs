"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = workerSuccessRating;
var sequelize_1 = require("sequelize");
// This is a view
function workerSuccessRating(sequelize) {
    var WorkerSuccessRating = sequelize.define('workerSuccessRating', {
        uuid: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        workerType: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        timestamp: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        availableRating: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        processingRating: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        failedRating: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        exitedRating: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });
    return WorkerSuccessRating;
}
