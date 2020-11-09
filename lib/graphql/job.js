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
var acquire_1 = __importDefault(require("./job/acquire"));
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
function JobConfiguration(graphqlTypes, models) {
    var _this = this;
    return {
        model: models.job,
        actions: ['list', 'update', 'create', 'count'],
        subscriptions: ['create', 'update', 'delete'],
        additionalMutations: {
            acquireJob: acquire_1["default"](graphqlTypes, models)
        },
        list: {
            before: function (findOptions) {
                return findOptions;
            }
        },
        update: {
            before: function (findOptions, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                var properties, job;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            properties = args.job;
                            return [4 /*yield*/, models.job.findByPk(args.job.id)];
                        case 1:
                            job = _a.sent();
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
                            return [2 /*return*/, properties];
                    }
                });
            }); }
        }
    };
}
exports["default"] = JobConfiguration;
