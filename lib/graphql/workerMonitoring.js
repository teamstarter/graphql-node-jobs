"use strict";
exports.__esModule = true;
exports.workerMonitoring = void 0;
var ping_1 = require("./workerMonitoring/mutations/ping");
var pong_1 = require("./workerMonitoring/mutations/pong");
var workerMonitorUpdate_1 = require("./workerMonitoring/mutations/workerMonitorUpdate");
var pinged_1 = require("./workerMonitoring/subscriptions/pinged");
var ponged_1 = require("./workerMonitoring/subscriptions/ponged");
var workerMonitoringUpdated_1 = require("./workerMonitoring/subscriptions/workerMonitoringUpdated");
function workerMonitoring(models, pubSubInstance) {
    return {
        model: models.workerMonitoring,
        actions: ['list'],
        list: {
            before: function (_a) {
                var findOptions = _a.findOptions;
                return findOptions;
            }
        },
        additionalMutations: {
            ping: (0, ping_1.ping)(pubSubInstance),
            pong: (0, pong_1.pong)(pubSubInstance),
            workerMonitoringUpdate: (0, workerMonitorUpdate_1.workerMonitorUpdate)(pubSubInstance, models)
        },
        additionalSubscriptions: {
            pinged: (0, pinged_1.pinged)(pubSubInstance),
            ponged: (0, ponged_1.ponged)(pubSubInstance),
            workerMonitoringUpdated: (0, workerMonitoringUpdated_1.workerMonitorUpdated)(pubSubInstance)
        }
    };
}
exports.workerMonitoring = workerMonitoring;
