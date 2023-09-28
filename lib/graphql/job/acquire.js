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
            workerType: { type: graphql_1.GraphQLString }
        },
        resolve: function (source, args, context) { return __awaiter(_this, void 0, void 0, function () {
            var transaction, allJobHoldType, heldTypes, conditions, job;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, models.sequelize.transaction()];
                    case 1:
                        transaction = _e.sent();
                        return [4 /*yield*/, models.jobHoldType.findAll({ transaction: transaction })];
                    case 2:
                        allJobHoldType = _e.sent();
                        heldTypes = allJobHoldType.map(function (heldType) { return heldType.type; });
                        if (heldTypes.includes('all')) {
                            return [2 /*return*/, null];
                        }
                        conditions = [
                            (_a = {
                                    type: args.typeList,
                                    status: 'queued'
                                },
                                _a[sequelize_1.Op.or] = [
                                    { startAfter: null },
                                    { startAfter: (_b = {}, _b[sequelize_1.Op.lt] = new Date(), _b) },
                                ],
                                _a),
                        ];
                        if (heldTypes && heldTypes.length && heldTypes.length > 0) {
                            conditions.push({
                                type: (_c = {}, _c[sequelize_1.Op.notIn] = heldTypes, _c)
                            });
                        }
                        return [4 /*yield*/, models.job.findOne({
                                where: (_d = {},
                                    _d[sequelize_1.Op.and] = conditions,
                                    _d),
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
                        return [2 /*return*/, job];
                }
            });
        }); }
    };
}
exports["default"] = AcquireJobDefinition;
