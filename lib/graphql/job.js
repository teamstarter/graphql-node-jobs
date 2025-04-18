"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.CancelRequestedError = void 0;
var debounce_1 = __importDefault(require("debounce"));
var putNextStepJobsInTheQueued_1 = __importDefault(require("./utils/putNextStepJobsInTheQueued"));
var updatePipelineStatus_1 = __importDefault(require("./utils/updatePipelineStatus"));
var date_fns_1 = require("date-fns");
var acquire_1 = __importDefault(require("./job/acquire"));
var recover_1 = __importDefault(require("./job/recover"));
var retry_1 = __importDefault(require("./job/retry"));
// You will throw a CancelRequestedError in your application to set the job status to 'cancelled'
var CancelRequestedError = /** @class */ (function (_super) {
    __extends(CancelRequestedError, _super);
    function CancelRequestedError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'CancelRequestedError';
        return _this;
    }
    return CancelRequestedError;
}(Error));
exports.CancelRequestedError = CancelRequestedError;
function getLastDoneStepDate(job) {
    var _a;
    // If there is not steps, we return the job start date.
    if (!((_a = job.processingInfo) === null || _a === void 0 ? void 0 : _a.steps)) {
        return job.startedAt;
    }
    var steps = job.processingInfo.steps;
    return Object.keys(steps).reduce(function (refDate, stepName) {
        var stepContent = steps[stepName];
        if (!stepContent.doneAt) {
            return refDate;
        }
        // If a step is older, we use the step value
        var jobDoneAt = new Date(stepContent.doneAt);
        if (jobDoneAt && (0, date_fns_1.isAfter)(jobDoneAt, refDate)) {
            return jobDoneAt;
        }
        return refDate;
    }, job.startedAt);
}
var allInstanceOfDebounceBatch = [];
function getInstanceOfDebounceBatch(batchId) {
    var instance = allInstanceOfDebounceBatch.filter(function (instance) { return instance.batchId === batchId; });
    if (!instance.length) {
        allInstanceOfDebounceBatch.push({
            batchId: batchId,
            debounce: (0, debounce_1["default"])(function (callback) { return callback(); }, 50)
        });
        return allInstanceOfDebounceBatch.filter(function (instance) { return instance.batchId === batchId; })[0].debounce;
    }
    return instance[0].debounce;
}
function JobConfiguration(graphqlTypes, models, pubSubInstance, onJobFail) {
    var _this = this;
    if (pubSubInstance === void 0) { pubSubInstance = null; }
    return {
        model: models.job,
        actions: ['list', 'update', 'create', 'count'],
        subscriptions: ['create', 'update', 'delete'],
        additionalMutations: {
            acquireJob: (0, acquire_1["default"])(graphqlTypes, models),
            recover: (0, recover_1["default"])(graphqlTypes, models),
            retryJob: (0, retry_1["default"])(graphqlTypes, models, pubSubInstance)
        },
        list: {
            before: function (_a) {
                var findOptions = _a.findOptions;
                return findOptions;
            }
        },
        update: {
            before: function (_a) {
                var args = _a.args;
                return __awaiter(_this, void 0, void 0, function () {
                    var properties, job, newSteps, steps_1, lastUpdatedDate_1;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                properties = args.job;
                                return [4 /*yield*/, models.job.findByPk(args.job.id)];
                            case 1:
                                job = _c.sent();
                                if (!job) {
                                    throw new Error("Could not find the job with the id [".concat(job.id, "]"));
                                }
                                // We set the end date when the status switch to a terminating state.
                                // End date can be either a success or a failure.
                                if (['successful', 'cancelled', 'failed'].includes(args.job.status) &&
                                    args.job.status !== job.status) {
                                    properties.endedAt = new Date();
                                }
                                if (job.status === 'cancel-requested' &&
                                    (!args.job.status || args.job.status === job.status)) {
                                    if (job.isUpdateAlreadyCalledWhileCancelRequested) {
                                        properties.status = 'cancelled';
                                        properties.cancelledAt = new Date();
                                        throw new Error('The job was requested to be cancelled at the previous call. Please check for the status "cancel-requested" after calling updateProcessingInfo in your worker and throw a CancelRequestedError');
                                    }
                                    else {
                                        properties.isUpdateAlreadyCalledWhileCancelRequested = true;
                                    }
                                }
                                // We set the start date when the status switch to processing.
                                if ('processing' === args.job.status && job.status === 'queued') {
                                    properties.startedAt = new Date();
                                }
                                // We set the cancelled date when the status switches.
                                if ('cancelled' === args.job.status && job.status !== args.job.status) {
                                    properties.cancelledAt = new Date();
                                }
                                // Queued job are instantly cancelled when requested to be cancelled.
                                if (args.job.status === 'cancel-requested' && job.status === 'queued') {
                                    properties.status = 'cancelled';
                                }
                                newSteps = null;
                                if (typeof args.job.processingInfo !== 'string' &&
                                    typeof args.job.processingInfo !== 'number' &&
                                    typeof args.job.processingInfo !== 'boolean' &&
                                    !Array.isArray(args.job.processingInfo) &&
                                    typeof ((_b = args.job.processingInfo) === null || _b === void 0 ? void 0 : _b.steps) !== 'undefined' &&
                                    typeof args.job.processingInfo.steps !== null) {
                                    steps_1 = args.job.processingInfo.steps;
                                    lastUpdatedDate_1 = getLastDoneStepDate(job);
                                    newSteps = Object.keys(steps_1).reduce(function (acc, stepName) {
                                        var newStepContent = steps_1[stepName];
                                        var previousStepContent = job.processingInfo &&
                                            job.processingInfo.steps ?
                                            job.processingInfo.steps[stepName] : null;
                                        var isStepAlreadySavedAsDone = previousStepContent &&
                                            previousStepContent.doneAt;
                                        // We set the end date when the status switch to a terminating state.
                                        if (newStepContent.status === 'done' && !isStepAlreadySavedAsDone) {
                                            var time = new Date();
                                            var prevTime = lastUpdatedDate_1;
                                            newStepContent.doneAt = time;
                                            newStepContent.elapsedTime = time.getTime() - prevTime.getTime();
                                        }
                                        // The previous step content contains informations that only the server might have
                                        // for exemple the doneAt and elapsedTime are maybe not taken in account by the client.
                                        // An accepted side effect is that it is impossible to remove an attribute from the processingInfo
                                        // through a client update. But it's way easier for users than have to sync the processingInfo themselves.
                                        acc[stepName] = __assign(__assign({}, previousStepContent), newStepContent);
                                        return acc;
                                    }, {});
                                    properties.processingInfo.steps = newSteps;
                                }
                                return [2 /*return*/, properties];
                        }
                    });
                });
            },
            after: function (_a) {
                var job = _a.updatedEntity, oldJob = _a.entitySnapshot;
                return __awaiter(_this, void 0, void 0, function () {
                    var debounceBatch, step, nextStep;
                    var _this = this;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!(job.status === 'failed' && onJobFail)) return [3 /*break*/, 2];
                                return [4 /*yield*/, onJobFail(job)];
                            case 1:
                                _b.sent();
                                _b.label = 2;
                            case 2:
                                if ((job.status === 'successful' || job.status === 'failed') &&
                                    job.batchId) {
                                    debounceBatch = getInstanceOfDebounceBatch(job.batchId);
                                    debounceBatch(function () { return __awaiter(_this, void 0, void 0, function () {
                                        var batch, jobs, allJobsAreSuccessful, step, nextStep;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, models.batch.findByPk(job.batchId)];
                                                case 1:
                                                    batch = _a.sent();
                                                    return [4 /*yield*/, models.job.findAll({
                                                            where: {
                                                                batchId: job.batchId
                                                            }
                                                        })];
                                                case 2:
                                                    jobs = _a.sent();
                                                    allJobsAreSuccessful = jobs.every(function (job) { return job.status === 'successful'; });
                                                    if (!allJobsAreSuccessful) return [3 /*break*/, 12];
                                                    return [4 /*yield*/, batch.update({
                                                            status: 'successful'
                                                        })];
                                                case 3:
                                                    _a.sent();
                                                    return [4 /*yield*/, models.pipelineStep.findOne({
                                                            where: { batchId: batch.id }
                                                        })];
                                                case 4:
                                                    step = _a.sent();
                                                    if (!step) return [3 /*break*/, 6];
                                                    return [4 /*yield*/, step.update({
                                                            status: 'done'
                                                        })];
                                                case 5:
                                                    _a.sent();
                                                    _a.label = 6;
                                                case 6: return [4 /*yield*/, models.pipelineStep.findOne({
                                                        where: {
                                                            pipelineId: batch.pipelineId,
                                                            status: 'planned'
                                                        },
                                                        order: [['index', 'ASC']]
                                                    })];
                                                case 7:
                                                    nextStep = _a.sent();
                                                    if (!nextStep) return [3 /*break*/, 9];
                                                    return [4 /*yield*/, (0, putNextStepJobsInTheQueued_1["default"])(nextStep, models)];
                                                case 8:
                                                    _a.sent();
                                                    return [3 /*break*/, 11];
                                                case 9: return [4 /*yield*/, (0, updatePipelineStatus_1["default"])(batch.pipelineId, models)];
                                                case 10:
                                                    _a.sent();
                                                    _a.label = 11;
                                                case 11: return [3 /*break*/, 14];
                                                case 12:
                                                    if (!!allJobsAreSuccessful) return [3 /*break*/, 14];
                                                    return [4 /*yield*/, batch.update({
                                                            status: 'failed'
                                                        })];
                                                case 13:
                                                    _a.sent();
                                                    _a.label = 14;
                                                case 14: return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                }
                                if (!((job.status === 'successful' || job.status === 'failed') &&
                                    job.pipelineId)) return [3 /*break*/, 9];
                                return [4 /*yield*/, models.pipelineStep.findOne({
                                        where: { jobId: job.id }
                                    })
                                    // When job of pipeline is successful we switch next job(s) status to queued
                                ];
                            case 3:
                                step = _b.sent();
                                if (!step) return [3 /*break*/, 9];
                                return [4 /*yield*/, step.update({
                                        status: 'done'
                                    })];
                            case 4:
                                _b.sent();
                                return [4 /*yield*/, models.pipelineStep.findOne({
                                        where: {
                                            pipelineId: step.pipelineId,
                                            status: 'planned'
                                        },
                                        order: [['index', 'ASC']]
                                    })];
                            case 5:
                                nextStep = _b.sent();
                                if (!nextStep) return [3 /*break*/, 7];
                                return [4 /*yield*/, (0, putNextStepJobsInTheQueued_1["default"])(nextStep, models)];
                            case 6:
                                _b.sent();
                                return [3 /*break*/, 9];
                            case 7: 
                            // When the last step of a pipeline is finished then we update its status
                            return [4 /*yield*/, (0, updatePipelineStatus_1["default"])(step.pipelineId, models)];
                            case 8:
                                // When the last step of a pipeline is finished then we update its status
                                _b.sent();
                                _b.label = 9;
                            case 9: return [2 /*return*/, job];
                        }
                    });
                });
            }
        },
        create: {
            before: function (_a) {
                var args = _a.args;
                return __awaiter(_this, void 0, void 0, function () {
                    var properties;
                    return __generator(this, function (_b) {
                        properties = args.job;
                        if ((properties.pipelineId || properties.batchId) &&
                            !properties.status) {
                            properties.status = 'planned';
                        }
                        return [2 /*return*/, properties];
                    });
                });
            },
            after: function (_a) {
                var job = _a.newEntity, source = _a.source, args = _a.args, context = _a.context, info = _a.info;
                return __awaiter(_this, void 0, void 0, function () {
                    var pipeline, indexCount;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!job.pipelineId) return [3 /*break*/, 4];
                                return [4 /*yield*/, models.pipeline.findByPk(job.pipelineId)];
                            case 1:
                                pipeline = _b.sent();
                                if (!!['successful', 'failed'].includes(pipeline.status)) return [3 /*break*/, 4];
                                return [4 /*yield*/, models.pipelineStep.count({
                                        where: {
                                            pipelineId: job.pipelineId
                                        }
                                    })];
                            case 2:
                                indexCount = _b.sent();
                                return [4 /*yield*/, models.pipelineStep.create({
                                        jobId: job.id,
                                        pipelineId: job.pipelineId,
                                        index: indexCount + 1
                                    })];
                            case 3:
                                _b.sent();
                                _b.label = 4;
                            case 4: return [2 /*return*/, job];
                        }
                    });
                });
            },
            preventDuplicateOnAttributes: ['jobUniqueId']
        }
    };
}
exports["default"] = JobConfiguration;
