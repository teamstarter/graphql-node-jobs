"use strict";
exports.__esModule = true;
function JobConfiguration(outputTypes, models) {
    return {
        model: models.job,
        actions: ['list', 'update', 'create'],
        list: {
            before: function (findOptions) {
                return findOptions;
            }
        }
    };
}
exports["default"] = JobConfiguration;
