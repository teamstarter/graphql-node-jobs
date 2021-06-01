"use strict";
exports.__esModule = true;
var sequelize_1 = require("sequelize");
function Pipeline(sequelize) {
    var Pipeline = sequelize.define('pipeline', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: 'planned',
            validate: {
                isIn: [['planned', 'processing', 'failed', 'successful']]
            }
        },
        name: {
            type: sequelize_1.DataTypes.STRING
        },
        metadata: {
            type: sequelize_1.DataTypes.STRING
        }
    }, {
        freezeTableName: true,
        tableName: 'pipeline',
        paranoid: true
    });
    Pipeline.associate = function (models) {
        models.pipeline.hasMany(models.batch, {
            as: 'batches',
            foreignKey: 'pipelineId',
            sourceKey: 'id'
        });
        models.pipeline.hasMany(models.job, {
            as: 'jobs',
            foreignKey: 'pipelineId',
            sourceKey: 'id'
        });
        models.pipeline.hasMany(models.pipelineStep, {
            as: 'steps',
            foreignKey: 'pipelineId',
            sourceKey: 'id'
        });
    };
    return Pipeline;
}
exports["default"] = Pipeline;
