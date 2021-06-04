"use strict";
exports.__esModule = true;
function WorkerMonitoringConfiguration(types, models) {
    return {
        model: models.workerMonitoring,
        actions: ['list'],
        list: {
            before: function (findOptions) {
                return findOptions;
            }
        }
    };
}
exports["default"] = WorkerMonitoringConfiguration;
