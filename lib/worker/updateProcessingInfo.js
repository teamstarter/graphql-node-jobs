"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var updateJobQuery_1 = __importDefault(require("./updateJobQuery"));
function updateProcessingInfo(client, job, processingInfo) {
    return client.mutate({
        mutation: updateJobQuery_1["default"],
        variables: {
            job: {
                id: job.id,
                processingInfo: processingInfo
            }
        }
    });
}
exports["default"] = updateProcessingInfo;
