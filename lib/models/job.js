"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Job;
var sequelize_1 = require("sequelize");
var version_1 = require("../version");
function Job(sequelize) {
    var Job = sequelize.define('job', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        jobUniqueId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        type: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
        },
        input: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },
        output: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },
        processingInfo: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: 'queued',
            validate: {
                isIn: [
                    [
                        'planned', // Job inside a batch or a pipeline. Waits to be moved to queued.˜
                        'queued', // default state for a new job without batch or pipeline
                        'processing',
                        'failed', // Due to an error
                        'successful',
                        'cancel-requested',
                        'cancelled', // Due to a programmatic request or an user request
                    ],
                ],
            },
        },
        retryOfJobId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        isUpdateAlreadyCalledWhileCancelRequested: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        batchId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        pipelineId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        workerId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        isHighFrequency: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        priorityLevel: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 4,
        },
        // When set, the job is not dispatched to workers reporting a lower version.
        requiredMinimumVersion: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                isValidVersion: function (value) {
                    // Custom validators also run when the value is null.
                    if (value !== null && value !== undefined && !(0, version_1.isValidVersion)(value)) {
                        throw new Error("requiredMinimumVersion must be a valid semver version (like \"1.2.3\"), got \"".concat(value, "\"."));
                    }
                },
            },
        },
        isRecoverable: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        startedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        startAfter: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        endedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
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
        cancelledAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    }, {
        freezeTableName: true,
        tableName: 'job',
        paranoid: true,
    });
    Job.associate = function (models) {
        models.job.belongsTo(models.batch, {
            foreignKey: 'batchId',
            sourceKey: 'id',
        });
        models.job.belongsTo(models.pipeline, {
            foreignKey: 'pipelineId',
            sourceKey: 'id',
        });
    };
    return Job;
}
