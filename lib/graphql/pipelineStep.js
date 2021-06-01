"use strict";
exports.__esModule = true;
function PipelineStepConfiguration(types, models) {
    return {
        model: models.pipelineStep,
        actions: ['list', 'update', 'create', 'count'],
        list: {
            before: function (findOptions) {
                return findOptions;
            }
        }
    };
}
exports["default"] = PipelineStepConfiguration;
