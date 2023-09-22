"use strict";
exports.__esModule = true;
var pinged_1 = require("./workerMonitoring/pinged");
var ponged_1 = require("./workerMonitoring/ponged");
function WorkerMonitoringConfiguration(types, models, pubSubInstance) {
    return {
        model: models.workerMonitoring,
        actions: ['list'],
        list: {
            before: function (findOptions) {
                return findOptions;
            }
        },
        additionalSubscriptions: {
            pinged: (0, pinged_1.pinged)(pubSubInstance),
            ponged: (0, ponged_1.ponged)(pubSubInstance)
        }
    };
}
exports["default"] = WorkerMonitoringConfiguration;
