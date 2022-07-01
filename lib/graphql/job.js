"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
        while (_) try {
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
var allInstanceOfDebounceBatch = [];
function getInstanceOfDebounceBatch(batchId) {
    var instance = allInstanceOfDebounceBatch.filter(function (instance) { return instance.batchId === batchId; });
    if (!instance.length) {
        allInstanceOfDebounceBatch.push({
            batchId: batchId,
            debounce: debounce_1["default"](function (callback) { return callback(); }, 50)
        });
        return allInstanceOfDebounceBatch.filter(function (instance) { return instance.batchId === batchId; })[0].debounce;
    }
    return instance[0].debounce;
}
function JobConfiguration(graphqlTypes, models, onFail) {
    var _this = this;
    return {
        model: models.job,
        actions: ['list', 'update', 'create', 'count'],
        subscriptions: ['create', 'update', 'delete'],
        additionalMutations: {
            acquireJob: acquire_1["default"](graphqlTypes, models),
            recover: recover_1["default"](graphqlTypes, models),
            retryJob: retry_1["default"](graphqlTypes, models)
        },
        list: {
            before: function (findOptions) {
                return findOptions;
            }
        },
        update: {
            before: function (findOptions, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                var properties, job, newProcessingInfo, steps_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            properties = args.job;
                            return [4 /*yield*/, models.job.findByPk(args.job.id)];
                        case 1:
                            job = _b.sent();
                            if (!job) {
                                throw new Error("Could not find the job with the id [" + job.id + "]");
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
                            newProcessingInfo = null;
                            if (typeof args.job.processingInfo !== 'string' &&
                                typeof args.job.processingInfo !== 'number' &&
                                typeof args.job.processingInfo !== 'boolean' &&
                                !Array.isArray(args.job.processingInfo) &&
                                typeof ((_a = args.job.processingInfo) === null || _a === void 0 ? void 0 : _a.steps) !== 'undefined' &&
                                typeof args.job.processingInfo.steps !== null) {
                                steps_1 = args.job.processingInfo.steps;
                                debugger;
                                newProcessingInfo = Object.keys(steps_1).reduce(function (acc, stepName) {
                                    var _a;
                                    var newStep = steps_1[stepName];
                                    if ((_a = job === null || job === void 0 ? void 0 : job.processingInfo) === null || _a === void 0 ? void 0 : _a.step) {
                                        newStep = __assign(__assign({}, newStep), job.processingInfo.step[stepName]);
                                    }
                                    if (newStep.status === 'done' && (newStep === null || newStep === void 0 ? void 0 : newStep.doneAt) === undefined) {
                                        debugger;
                                        var time = new Date();
                                        var prevTime = new Date(job.updatedAt);
                                        newStep.doneAt = time;
                                        newStep.elapsedTime = time.getTime() - prevTime.getTime();
                                    }
                                    acc[stepName] = newStep;
                                    return acc;
                                }, {});
                                properties.steps = newProcessingInfo;
                            }
                            return [2 /*return*/, properties];
                    }
                });
            }); },
            after: function (job, oldJob) { return __awaiter(_this, void 0, void 0, function () {
                var debounceBatch, step, nextStep;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(job.status === 'failed' && onFail)) return [3 /*break*/, 2];
                            return [4 /*yield*/, onFail(job)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
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
                                                if (!allJobsAreSuccessful) return [3 /*break*/, 10];
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
                                                if (step) {
                                                    step.update({
                                                        status: 'done'
                                                    });
                                                }
                                                return [4 /*yield*/, models.pipelineStep.findOne({
                                                        where: {
                                                            pipelineId: batch.pipelineId,
                                                            status: 'planned'
                                                        },
                                                        order: [['index', 'ASC']]
                                                    })];
                                            case 5:
                                                nextStep = _a.sent();
                                                if (!nextStep) return [3 /*break*/, 7];
                                                return [4 /*yield*/, putNextStepJobsInTheQueued_1["default"](nextStep, models)];
                                            case 6:
                                                _a.sent();
                                                return [3 /*break*/, 9];
                                            case 7: return [4 /*yield*/, updatePipelineStatus_1["default"](batch.pipelineId, models)];
                                            case 8:
                                                _a.sent();
                                                _a.label = 9;
                                            case 9: return [3 /*break*/, 12];
                                            case 10:
                                                if (!!allJobsAreSuccessful) return [3 /*break*/, 12];
                                                return [4 /*yield*/, batch.update({
                                                        status: 'failed'
                                                    })];
                                            case 11:
                                                _a.sent();
                                                _a.label = 12;
                                            case 12: return [2 /*return*/];
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
                            step = _a.sent();
                            if (!step) return [3 /*break*/, 9];
                            return [4 /*yield*/, step.update({
                                    status: 'done'
                                })];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, models.pipelineStep.findOne({
                                    where: {
                                        pipelineId: step.pipelineId,
                                        status: 'planned'
                                    },
                                    order: [['index', 'ASC']]
                                })];
                        case 5:
                            nextStep = _a.sent();
                            if (!nextStep) return [3 /*break*/, 7];
                            return [4 /*yield*/, putNextStepJobsInTheQueued_1["default"](nextStep, models)];
                        case 6:
                            _a.sent();
                            return [3 /*break*/, 9];
                        case 7: 
                        // When the last step of a pipeline is finished then we update its status
                        return [4 /*yield*/, updatePipelineStatus_1["default"](step.pipelineId, models)];
                        case 8:
                            // When the last step of a pipeline is finished then we update its status
                            _a.sent();
                            _a.label = 9;
                        case 9: return [2 /*return*/, job];
                    }
                });
            }); }
        },
        create: {
            before: function (findOptions, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                var properties;
                return __generator(this, function (_a) {
                    properties = args.job;
                    if ((properties.pipelineId || properties.batchId) &&
                        !properties.status) {
                        properties.status = 'planned';
                    }
                    return [2 /*return*/, properties];
                });
            }); },
            after: function (job, source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                var pipeline, indexCount;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!job.pipelineId) return [3 /*break*/, 4];
                            return [4 /*yield*/, models.pipeline.findByPk(job.pipelineId)];
                        case 1:
                            pipeline = _a.sent();
                            if (!!['successful', 'failed'].includes(pipeline.status)) return [3 /*break*/, 4];
                            return [4 /*yield*/, models.pipelineStep.count({
                                    where: {
                                        pipelineId: job.pipelineId
                                    }
                                })];
                        case 2:
                            indexCount = _a.sent();
                            return [4 /*yield*/, models.pipelineStep.create({
                                    jobId: job.id,
                                    pipelineId: job.pipelineId,
                                    index: indexCount + 1
                                })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/, job];
                    }
                });
            }); },
            preventDuplicateOnAttributes: ['jobUniqueId']
        }
    };
}
exports["default"] = JobConfiguration;
