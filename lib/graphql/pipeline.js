"use strict";
exports.__esModule = true;
function PipelineConfiguration(types, models) {
    return {
        model: models.pipeline,
        actions: ['list', 'update', 'create', 'count'],
        list: {
            before: function (findOptions) {
                return findOptions;
            }
        }
    };
}
exports["default"] = PipelineConfiguration;
