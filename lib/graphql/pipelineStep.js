"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PipelineStepConfiguration;
function PipelineStepConfiguration(types, models) {
    return {
        model: models.pipelineStep,
        actions: ['list', 'update', 'create', 'count'],
        list: {
            beforeList: function (_a) {
                var findOptions = _a.findOptions;
                return findOptions;
            },
        },
    };
}
