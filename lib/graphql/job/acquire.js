"use strict";
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
var graphql_1 = require("graphql");
var sequelize_1 = require("sequelize");
var debounce_1 = __importDefault(require("debounce"));
var allInstanceOfDebounceWorker = [];
function getInstanceOfDebounceWorker(workerId) {
    var _this = this;
    var instance = allInstanceOfDebounceWorker.filter(function (instance) { return instance.workerId === workerId; });
    if (!instance.length) {
        allInstanceOfDebounceWorker.push({
            workerId: workerId,
            debounce: debounce_1["default"](function (callback) { return callback(); }, 50)
        });
        return process.env.NO_ASYNC === 'true'
            ? function (callback) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, callback()];
            }); }); }
            : allInstanceOfDebounceWorker.filter(function (instance) { return instance.workerId === workerId; })[0].debounce;
    }
    return process.env.NO_ASYNC === 'true'
        ? function (callback) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, callback()];
        }); }); }
        : instance[0].debounce;
}
function AcquireJobDefinition(graphqlTypes, models) {
    var _this = this;
    return {
        type: graphqlTypes.outputTypes.job,
        description: 'Try to find a job of a given type and assign it to the given worker.',
        args: {
            typeList: {
                type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLString)))
            },
            workerId: { type: graphql_1.GraphQLString }
        },
        resolve: function (source, args, context) { return __awaiter(_this, void 0, void 0, function () {
            var transaction, allJobHoldType, heldTypes, job, debounceWorker;
            var _a, _b, _c, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, models.sequelize.transaction()];
                    case 1:
                        transaction = _e.sent();
                        return [4 /*yield*/, models.jobHoldType.findAll({ transaction: transaction })];
                    case 2:
                        allJobHoldType = _e.sent();
                        heldTypes = allJobHoldType.map(function (heldType) { return heldType.type; });
                        return [4 /*yield*/, models.job.findOne({
                                where: (_a = {},
                                    _a[sequelize_1.Op.and] = [
                                        (_b = {
                                                type: args.typeList,
                                                status: 'queued'
                                            },
                                            _b[sequelize_1.Op.or] = [
                                                { startAfter: null },
                                                { startAfter: (_c = {}, _c[sequelize_1.Op.lt] = new Date(), _c) },
                                            ],
                                            _b),
                                        heldTypes.length && {
                                            type: (_d = {}, _d[sequelize_1.Op.ne] = heldTypes, _d)
                                        },
                                    ],
                                    _a),
                                order: [['id', 'ASC']],
                                transaction: transaction
                            })];
                    case 3:
                        job = _e.sent();
                        if (!!job) return [3 /*break*/, 5];
                        return [4 /*yield*/, transaction.commit()];
                    case 4:
                        _e.sent();
                        return [2 /*return*/, null];
                    case 5: return [4 /*yield*/, job.update({
                            workerId: args.workerId,
                            status: 'processing',
                            startedAt: new Date()
                        }, { transaction: transaction })];
                    case 6:
                        _e.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 7:
                        _e.sent();
                        if (!args.workerId) return [3 /*break*/, 9];
                        debounceWorker = getInstanceOfDebounceWorker(args.workerId);
                        return [4 /*yield*/, debounceWorker(function () { return __awaiter(_this, void 0, void 0, function () {
                                var workerMonitoring;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, models.workerMonitoring.findOne({
                                                where: { workerId: args.workerId }
                                            })];
                                        case 1:
                                            workerMonitoring = _a.sent();
                                            if (!workerMonitoring) return [3 /*break*/, 3];
                                            return [4 /*yield*/, workerMonitoring.update({
                                                    lastCalledAt: new Date()
                                                })];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 5];
                                        case 3: return [4 /*yield*/, models.workerMonitoring.create({
                                                workerId: args.workerId,
                                                lastCalledAt: new Date()
                                            })];
                                        case 4:
                                            _a.sent();
                                            _a.label = 5;
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 8:
                        _e.sent();
                        _e.label = 9;
                    case 9: return [2 /*return*/, job];
                }
            });
        }); }
    };
}
exports["default"] = AcquireJobDefinition;
