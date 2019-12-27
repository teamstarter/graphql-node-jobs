"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var acquire_1 = __importDefault(require("./job/acquire"));
function JobConfiguration(graphqlTypes, models) {
    return {
        model: models.job,
        actions: ['list', 'update', 'create'],
        additionalMutations: {
            acquireJob: acquire_1["default"](graphqlTypes, models)
        },
        list: {
            before: function (findOptions) {
                return findOptions;
            }
        }
    };
}
exports["default"] = JobConfiguration;
