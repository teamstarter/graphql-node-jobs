"use strict";
exports.__esModule = true;
function PipelineStepConfiguration(types, models) {
    return {
        model: models.pipelineStep,
        actions: ['list', 'update', 'create', 'count'],
        list: {
            beforeList: function (_a) {
                var findOptions = _a.findOptions;
                return findOptions;
            }
        }
    };
}
exports["default"] = PipelineStepConfiguration;
