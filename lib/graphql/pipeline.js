"use strict";
exports.__esModule = true;
function PipelineConfiguration(outputTypes, models) {
    return {
        model: models.pipeline,
        actions: ['list'],
        list: {
            before: function (findOptions) {
                return findOptions;
            }
        }
    };
}
exports["default"] = PipelineConfiguration;
