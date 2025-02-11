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
exports.__esModule = true;
var graphql_1 = require("graphql");
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
            return __generator(this, function (_a) {
                return [2 /*return*/, acquireJob(models, args)];
            });
        }); }
    };
}
exports["default"] = AcquireJobDefinition;
function acquireJob(models, args) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var heldTypes, result, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, models.jobHoldType.findAll({
                            attributes: ['type']
                        })];
                case 1:
                    heldTypes = (_b.sent()).map(function (heldType) { return heldType.type; });
                    // Check if 'all' is held
                    if (heldTypes.includes('all')) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, models.sequelize.query("\n      UPDATE job\n      SET \"workerId\" = ".concat(args.workerId ? ':workerId' : 'NULL', ",\n          \"status\" = 'processing',\n          \"startedAt\" = CURRENT_TIMESTAMP\n      FROM (\n        SELECT id\n        FROM job\n        WHERE type IN(:typeList)\n          AND \"status\" = 'queued'\n          AND (job.\"startAfter\" IS NULL OR \n            job.\"startAfter\" <= current_timestamp)\n          AND type NOT IN (\n            SELECT type\n            FROM \"jobHoldType\" WHERE \"deletedAt\" IS NULL\n          )\n          AND job.\"deletedAt\" IS NULL\n        ORDER BY id ASC\n        LIMIT 1\n        FOR UPDATE SKIP LOCKED\n      ) as subquery\n      WHERE job.id = subquery.id\n      RETURNING *;\n      "), {
                            replacements: __assign(__assign({}, (args.workerId ? { workerId: args.workerId } : {})), { typeList: args.typeList })
                        })
                        // If a job was updated, result[0][0] contains the job details
                    ];
                case 2:
                    result = _b.sent();
                    // If a job was updated, result[0][0] contains the job details
                    return [2 /*return*/, ((_a = result[0]) === null || _a === void 0 ? void 0 : _a[0]) || null];
                case 3:
                    error_1 = _b.sent();
                    console.error('Failed to acquire job:', error_1);
                    throw new Error('Error acquiring job');
                case 4: return [2 /*return*/];
            }
        });
    });
}
