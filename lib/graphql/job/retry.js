"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var graphql_1 = require("graphql");
var status = [
    'planned',
    'queued',
    'processing',
    'successful',
    'cancel-requested',
    'cancelled',
];
function RetryJob(graphqlTypes, models, pubSubInstance) {
    var _this = this;
    if (pubSubInstance === void 0) { pubSubInstance = null; }
    return {
        type: graphqlTypes.outputTypes.job,
        description: 'Retry a job which fail',
        args: {
            id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) }
        },
        resolve: function (source, args, context) { return __awaiter(_this, void 0, void 0, function () {
            var job, attributesToDelete, oldJobAttributes, attributes, newJob;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, models.job.findByPk(args.id)];
                    case 1:
                        job = _b.sent();
                        if (!job) {
                            throw new Error('The job does not exist.');
                        }
                        if (job.status !== 'failed' && job.status !== 'cancelled') {
                            throw new Error('The job must be failed or cancelled.');
                        }
                        attributesToDelete = [
                            'id',
                            'createdAt',
                            'updateAt',
                            'status',
                            'startedAt',
                            'failedAt',
                            'isUpdateAlreadyCalledWhileCancelRequested',
                            'workerId',
                            'endedAt',
                            'deletedAt',
                            'cancelledAt',
                        ];
                        oldJobAttributes = Object.keys(job.dataValues).reduce(function (acc, attribute) {
                            if (!attributesToDelete.includes(attribute)) {
                                if (attribute === 'output' && job.status !== 'cancelled') {
                                    // We do not keep errors raised by a worker.
                                    if (job.dataValues[attribute].error) {
                                        var _a = job.dataValues[attribute], otherAttributes = _a.otherAttributes, error = __rest(_a, ["otherAttributes"]);
                                        acc[attribute] = otherAttributes;
                                        return acc;
                                    }
                                }
                                acc[attribute] = job.dataValues[attribute];
                            }
                            return acc;
                        }, {});
                        attributes = __assign(__assign({}, oldJobAttributes), { retryOfJobId: job.id });
                        return [4 /*yield*/, models.job.create(attributes)];
                    case 2:
                        newJob = _b.sent();
                        if (pubSubInstance) {
                            pubSubInstance.publish("jobCreated", (_a = {},
                                _a["jobCreated"] = newJob.get(),
                                _a));
                        }
                        return [2 /*return*/, newJob];
                }
            });
        }); }
    };
}
exports["default"] = RetryJob;
