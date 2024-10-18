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
exports.__esModule = true;
var graphql_1 = require("graphql");
var sequelize_1 = require("sequelize");
function AcquireJobDefinition(graphqlTypes, models) {
    var _this = this;
    return {
        type: graphqlTypes.outputTypes.job,
        description: 'Try to find a job of a given type and assign it to the given worker.',
        args: {
            typeList: {
                type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLString)))
            },
            workerId: { type: graphql_1.GraphQLString },
            workerType: { type: graphql_1.GraphQLString },
            useRowLocking: { type: graphql_1.GraphQLBoolean }
        },
        resolve: function (source, args, context) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, acquireJobWithRetry(models, args, 5)]; // Retry up to 5 times
            });
        }); }
    };
}
exports["default"] = AcquireJobDefinition;
function acquireJobWithRetry(models, args, maxAttempts) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var attempt, baseDelay, maxDelay, _loop_1, state_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    attempt = 0;
                    baseDelay = 100 // milliseconds
                    ;
                    maxDelay = 2000 // milliseconds
                    ;
                    _loop_1 = function () {
                        var useRowLocking, supportsRowLevelLocking, _c, _d, error_1, exponentialDelay, delay_1;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    _e.trys.push([0, 6, , 8]);
                                    useRowLocking = (_a = args.useRowLocking) !== null && _a !== void 0 ? _a : false;
                                    return [4 /*yield*/, canUseRowLevelLocking(models)];
                                case 1:
                                    supportsRowLevelLocking = _e.sent();
                                    if (!(useRowLocking && supportsRowLevelLocking)) return [3 /*break*/, 3];
                                    _c = {};
                                    return [4 /*yield*/, acquireJobWithRowLocking(models, args)];
                                case 2: return [2 /*return*/, (_c.value = _e.sent(), _c)];
                                case 3:
                                    _d = {};
                                    return [4 /*yield*/, acquireJobWithOptimisticLocking(models, args)];
                                case 4: return [2 /*return*/, (_d.value = _e.sent(), _d)];
                                case 5: return [3 /*break*/, 8];
                                case 6:
                                    error_1 = _e.sent();
                                    attempt++;
                                    if (attempt >= maxAttempts) {
                                        console.error("All retry attempts failed after ".concat(attempt, " tries:"), error_1);
                                        throw new Error('Error acquiring job after maximum retry attempts.');
                                    }
                                    exponentialDelay = baseDelay * Math.pow(2, attempt);
                                    delay_1 = Math.min(exponentialDelay + Math.floor(Math.random() * baseDelay), maxDelay);
                                    console.log("Retrying... attempt ".concat(attempt, ", waiting ").concat(delay_1, "ms"));
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })]; // Wait before retrying
                                case 7:
                                    _e.sent(); // Wait before retrying
                                    return [3 /*break*/, 8];
                                case 8: return [2 /*return*/];
                            }
                        });
                    };
                    _b.label = 1;
                case 1:
                    if (!(attempt < maxAttempts)) return [3 /*break*/, 3];
                    return [5 /*yield**/, _loop_1()];
                case 2:
                    state_1 = _b.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function canUseRowLevelLocking(models) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, models.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, models.job.findOne({
                                            lock: sequelize_1.Transaction.LOCK.UPDATE,
                                            skipLocked: true,
                                            transaction: transaction
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
                case 2:
                    error_2 = _a.sent();
                    console.error('Row level locking not supported:', error_2);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function acquireJobWithOptimisticLocking(models, args) {
    return __awaiter(this, void 0, void 0, function () {
        var heldTypes, conditions, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getHeldTypes(models)];
                case 1:
                    heldTypes = _a.sent();
                    if (heldTypes.includes('all')) {
                        return [2 /*return*/, null];
                    }
                    conditions = buildConditions(args, heldTypes);
                    return [4 /*yield*/, attemptJobAcquisition(models, conditions, args)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_3 = _a.sent();
                    console.error('Failed to acquire job with optimistic locking:', error_3);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function acquireJobWithRowLocking(models, args) {
    return __awaiter(this, void 0, void 0, function () {
        var transactionOptions, error_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    transactionOptions = {
                        isolationLevel: sequelize_1.Transaction.ISOLATION_LEVELS.SERIALIZABLE
                    };
                    return [4 /*yield*/, models.sequelize.transaction(transactionOptions, function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                            var heldTypes, conditions;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, getHeldTypes(models, transaction)];
                                    case 1:
                                        heldTypes = _a.sent();
                                        if (heldTypes.includes('all')) {
                                            return [2 /*return*/, null];
                                        }
                                        conditions = buildConditions(args, heldTypes);
                                        return [4 /*yield*/, attemptJobAcquisition(models, conditions, args, transaction)];
                                    case 2: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_4 = _a.sent();
                    console.error('Failed to acquire job with row locking:', error_4);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function attemptJobAcquisition(models, conditions, args, transaction) {
    return __awaiter(this, void 0, void 0, function () {
        var findOptions, job, updateFields, updateOptions, updatedRows, error_5;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    findOptions = {
                        where: (_a = {}, _a[sequelize_1.Op.and] = conditions, _a),
                        order: [['id', 'ASC']],
                        transaction: transaction
                    };
                    if (transaction) {
                        findOptions.lock = sequelize_1.Transaction.LOCK.UPDATE;
                        findOptions.skipLocked = true;
                    }
                    return [4 /*yield*/, models.job.findOne(findOptions)];
                case 1:
                    job = _b.sent();
                    if (!job) {
                        return [2 /*return*/, null];
                    }
                    updateFields = {
                        workerId: args.workerId,
                        status: 'processing',
                        startedAt: new Date()
                    };
                    updateOptions = {
                        where: { id: job.id, status: 'queued' },
                        transaction: transaction
                    };
                    return [4 /*yield*/, models.job.update(updateFields, updateOptions)];
                case 2:
                    updatedRows = (_b.sent())[0];
                    if (updatedRows === 0) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, models.job.findByPk(job.id, { transaction: transaction })];
                case 3: return [2 /*return*/, _b.sent()];
                case 4:
                    error_5 = _b.sent();
                    console.error('Failed during job acquisition update:', error_5);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getHeldTypes(models, transaction) {
    return __awaiter(this, void 0, void 0, function () {
        var allJobHoldType, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, models.jobHoldType.findAll({ transaction: transaction })];
                case 1:
                    allJobHoldType = _a.sent();
                    console.log('All job hold types:', allJobHoldType);
                    return [2 /*return*/, allJobHoldType.map(function (heldType) { return heldType.type; })];
                case 2:
                    error_6 = _a.sent();
                    console.error('Failed to retrieve job hold types:', error_6);
                    throw error_6; // Re-throwing the error to propagate it up the call stack
                case 3: return [2 /*return*/];
            }
        });
    });
}
function buildConditions(args, heldTypes) {
    var _a, _b, _c;
    // Start with conditions that are always applied
    var conditions = [
        (_a = {
                type: args.typeList,
                status: 'queued'
            },
            _a[sequelize_1.Op.or] = [{ startAfter: null }, { startAfter: (_b = {}, _b[sequelize_1.Op.lt] = new Date(), _b) }],
            _a),
    ];
    if (heldTypes.length > 0) {
        conditions.push({
            type: (_c = {}, _c[sequelize_1.Op.notIn] = heldTypes, _c)
        });
    }
    return conditions;
}
