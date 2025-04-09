"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var start_1 = __importDefault(require("./pipeline/start"));
function PipelineConfiguration(graphqlTypes, models) {
    return {
        model: models.pipeline,
        actions: ['list', 'update', 'create', 'count'],
        additionalMutations: {
            startPipeline: (0, start_1["default"])(graphqlTypes, models)
        },
        list: {
            beforeList: function (_a) {
                var findOptions = _a.findOptions;
                return findOptions;
            }
        }
    };
}
exports["default"] = PipelineConfiguration;
