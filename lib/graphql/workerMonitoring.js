"use strict";
exports.__esModule = true;
exports.workerMonitoring = void 0;
var pinged_1 = require("./workerMonitoring/pinged");
var ponged_1 = require("./workerMonitoring/ponged");
var ping_1 = require("./workerMonitoring/ping");
var pong_1 = require("./workerMonitoring/pong");
var workerMonitoringUpdated_1 = require("./workerMonitoring/workerMonitoringUpdated");
var workerMonitorUpdate_1 = require("./workerMonitoring/workerMonitorUpdate");
function workerMonitoring(models, pubSubInstance) {
    return {
        model: models.workerMonitoring,
        actions: ['list'],
        list: {
            before: function (findOptions) {
                return findOptions;
            }
        },
        additionalMutations: {
            ping: (0, ping_1.ping)(pubSubInstance),
            pong: (0, pong_1.pong)(pubSubInstance, models),
            workerMonitoringUpdate: (0, workerMonitorUpdate_1.workerMonitorUpdate)(pubSubInstance)
        },
        additionalSubscriptions: {
            pinged: (0, pinged_1.pinged)(pubSubInstance),
            ponged: (0, ponged_1.ponged)(pubSubInstance),
            workerMonitoringUpdated: (0, workerMonitoringUpdated_1.workerMonitoringUpdated)(pubSubInstance)
        }
    };
}
exports.workerMonitoring = workerMonitoring;
