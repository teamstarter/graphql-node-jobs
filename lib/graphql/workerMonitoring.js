"use strict";
exports.__esModule = true;
var pinged_1 = require("./workerMonitoring/pinged");
var ponged_1 = require("./workerMonitoring/ponged");
var ping_1 = require("./workerMonitoring/ping");
var pong_1 = require("./workerMonitoring/pong");
function WorkerMonitoringConfiguration(types, models, pubSubInstance) {
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
            pong: (0, pong_1.pong)(pubSubInstance, models)
        },
        additionalSubscriptions: {
            pinged: (0, pinged_1.pinged)(pubSubInstance),
            ponged: (0, ponged_1.ponged)(pubSubInstance)
        }
    };
}
exports["default"] = WorkerMonitoringConfiguration;
