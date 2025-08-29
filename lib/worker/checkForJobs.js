"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
var debug_1 = __importDefault(require("debug"));
var graphql_tag_1 = __importDefault(require("graphql-tag"));
var uuid_1 = __importDefault(require("uuid"));
var worker_threads_1 = require("worker_threads");
var updateJobQuery_1 = __importDefault(require("./updateJobQuery"));
var updateProcessingInfo_1 = __importDefault(require("./updateProcessingInfo"));
var debug = (0, debug_1["default"])('graphql-node-jobs');
var DEFAULT_LOOP_TIME = 1000;
var acquireJobQuery = (0, graphql_tag_1["default"])(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  mutation acquireJob(\n    $typeList: [String!]!\n    $workerId: String\n    $workerType: String\n  ) {\n    job: acquireJob(\n      typeList: $typeList\n      workerId: $workerId\n      workerType: $workerType\n    ) {\n      id\n      type\n      name\n      input\n      output\n      status\n    }\n  }\n"], ["\n  mutation acquireJob(\n    $typeList: [String!]!\n    $workerId: String\n    $workerType: String\n  ) {\n    job: acquireJob(\n      typeList: $typeList\n      workerId: $workerId\n      workerType: $workerType\n    ) {\n      id\n      type\n      name\n      input\n      output\n      status\n    }\n  }\n"])));
function handleJobResult(_a) {
    var client = _a.client, job = _a.job, output = _a.output, looping = _a.looping, args = _a.args;
    return __awaiter(this, void 0, void 0, function () {
        var result, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    debug('Updating job after successful processing.');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.mutate({
                            mutation: updateJobQuery_1["default"],
                            variables: {
                                job: {
                                    id: job.id,
                                    status: 'successful',
                                    output: output
                                }
                            }
                        })];
                case 2:
                    result = _b.sent();
                    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ status: 'AVAILABLE' });
                    if (looping) {
                        return [2 /*return*/, checkForJobs(args)];
                    }
                    return [2 /*return*/, result.data.job];
                case 3:
                    err_1 = _b.sent();
                    debug('Failed to update the success status of the current job.', err_1);
                    return [2 /*return*/, handleError({ err: err_1, client: client, job: job, looping: looping, args: args })
                        //parentPort?.postMessage({ status: 'FAILED' })
                    ];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleError(_a) {
    var err = _a.err, client = _a.client, job = _a.job, looping = _a.looping, args = _a.args;
    return __awaiter(this, void 0, void 0, function () {
        var updatedErrorJob;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    debug('Error during the job processing', err);
                    updatedErrorJob = null;
                    if (!(err.name === 'CancelRequestedError')) return [3 /*break*/, 2];
                    return [4 /*yield*/, client.mutate({
                            mutation: updateJobQuery_1["default"],
                            variables: {
                                job: {
                                    id: job.id,
                                    status: 'cancelled',
                                    output: {
                                        cancelMessage: err.message || 'No cancel message provided'
                                    }
                                }
                            }
                        })];
                case 1:
                    updatedErrorJob = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, client.mutate({
                        mutation: updateJobQuery_1["default"],
                        variables: {
                            job: {
                                id: job.id,
                                status: 'failed',
                                output: {
                                    error: "[".concat(err.toString(), "] Stack: ").concat(err.stack ? err.stack.toString() : 'No stack available.')
                                }
                            }
                        }
                    })];
                case 3:
                    updatedErrorJob = _b.sent();
                    _b.label = 4;
                case 4:
                    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ status: 'AVAILABLE' });
                    if (looping) {
                        return [2 /*return*/, checkForJobs(args)];
                    }
                    return [2 /*return*/, updatedErrorJob.data.job];
            }
        });
    });
}
function checkForJobs(args) {
    return __awaiter(this, void 0, void 0, function () {
        var processingFunction, client, typeList, _a, workerId, workerType, _b, looping, _c, loopTime, _d, isCancelledOnCancelRequest, _e, nonBlocking, data, job, output, processingPromise, err_2;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!args.typeList || args.typeList.length === 0) {
                        throw new Error('Please provide a typeList property in the configuration.');
                    }
                    if (!args.workerId) {
                        args.workerId = (0, uuid_1["default"])();
                    }
                    processingFunction = args.processingFunction, client = args.client, typeList = args.typeList, _a = args.workerId, workerId = _a === void 0 ? undefined : _a, workerType = args.workerType, _b = args.looping, looping = _b === void 0 ? true : _b, _c = args.loopTime, loopTime = _c === void 0 ? DEFAULT_LOOP_TIME : _c, _d = args.isCancelledOnCancelRequest, isCancelledOnCancelRequest = _d === void 0 ? false : _d, _e = args.nonBlocking, nonBlocking = _e === void 0 ? false : _e;
                    return [4 /*yield*/, client.mutate({
                            mutation: acquireJobQuery,
                            variables: { typeList: typeList, workerId: workerId, workerType: workerType }
                        })];
                case 1:
                    data = (_f.sent()).data;
                    job = data.job;
                    if (!job) {
                        if (looping) {
                            setTimeout(function () { return checkForJobs(args); }, loopTime);
                            return [2 /*return*/, null];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                    }
                    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ status: 'PROCESSING' });
                    debug('Reiceived a new job', job);
                    output = null;
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 7, , 8]);
                    processingPromise = processingFunction(job, {
                        updateProcessingInfo: function (info) {
                            return (0, updateProcessingInfo_1["default"])(client, job, info, isCancelledOnCancelRequest);
                        }
                    });
                    if (!nonBlocking) return [3 /*break*/, 3];
                    processingPromise.then(function (output) {
                        debug("Job's done", job.id);
                        // We only save the result, the looping will be instantly started
                        handleJobResult({ client: client, job: job, output: output, looping: false, args: args });
                    })["catch"](function (err) {
                        handleError({ err: err, client: client, job: job, looping: looping, args: args });
                    });
                    if (looping) {
                        return [2 /*return*/, checkForJobs(args)];
                    }
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, processingPromise];
                case 4:
                    output = _f.sent();
                    debug("Job's done", job.id);
                    return [4 /*yield*/, handleJobResult({ client: client, job: job, output: output, looping: looping, args: args })];
                case 5: return [2 /*return*/, _f.sent()];
                case 6: return [3 /*break*/, 8];
                case 7:
                    err_2 = _f.sent();
                    return [2 /*return*/, handleError({ err: err_2, client: client, job: job, looping: looping, args: args })];
                case 8: 
                // In the case the looping is not enabled and the async processing is not enabled
                // we return the "processing" job.
                return [2 /*return*/, job];
            }
        });
    });
}
exports["default"] = checkForJobs;
var templateObject_1;
