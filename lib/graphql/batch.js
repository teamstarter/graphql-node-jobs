"use strict";
exports.__esModule = true;
function BatchConfiguration(outputTypes, models) {
    return {
        model: models.batch,
        actions: ['list'],
        list: {
            before: function (findOptions) {
                return findOptions;
            }
        }
    };
}
exports["default"] = BatchConfiguration;
