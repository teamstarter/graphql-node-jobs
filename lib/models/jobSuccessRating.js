"use strict";
exports.__esModule = true;
var sequelize_1 = require("sequelize");
// This is a view
function JobSuccessRating(sequelize) {
    var JobSuccessRating = sequelize.define('jobSuccessRating', {
        day: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        successRating: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        successfulJobs: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        failedJobs: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        totalJobs: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        freezeTableName: true
    });
    JobSuccessRating.removeAttribute('id');
    return JobSuccessRating;
}
exports["default"] = JobSuccessRating;
