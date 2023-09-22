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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var graphql_sequelize_generator_1 = require("graphql-sequelize-generator");
var models_1 = __importDefault(require("../models"));
var job_1 = __importDefault(require("./job"));
var batch_1 = __importDefault(require("./batch"));
var pipeline_1 = __importDefault(require("./pipeline"));
var pipelineStep_1 = __importDefault(require("./pipelineStep"));
var jobHoldType_1 = __importDefault(require("./jobHoldType"));
var workerMonitoring_1 = __importDefault(require("./workerMonitoring"));
/**
 * @param dbConfig Sequelize database configuration object
 * @param gsgParams Params from graphql-sequelize-generator that overwrite the default ones.
 */
function getApolloServer(dbConfig, gsgParams, customMutations, onJobFail, wsServer) {
    if (gsgParams === void 0) { gsgParams = {}; }
    if (customMutations === void 0) { customMutations = {}; }
    if (wsServer === void 0) { wsServer = null; }
    return __awaiter(this, void 0, void 0, function () {
        var models, types, jobsFail, _i, jobsFail_1, job_2, pubSub, graphqlSchemaDeclaration;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, models_1["default"])(dbConfig)];
                case 1:
                    models = _a.sent();
                    types = (0, graphql_sequelize_generator_1.generateModelTypes)(models);
                    return [4 /*yield*/, models.job.findAll({
                            where: { status: 'processing' }
                        })];
                case 2:
                    jobsFail = _a.sent();
                    if (!(jobsFail.length > 0)) return [3 /*break*/, 7];
                    return [4 /*yield*/, models.sequelize.query("UPDATE job SET status = 'failed' WHERE status = 'processing'")];
                case 3:
                    _a.sent();
                    if (!onJobFail) return [3 /*break*/, 7];
                    _i = 0, jobsFail_1 = jobsFail;
                    _a.label = 4;
                case 4:
                    if (!(_i < jobsFail_1.length)) return [3 /*break*/, 7];
                    job_2 = jobsFail_1[_i];
                    return [4 /*yield*/, onJobFail(job_2)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    pubSub = gsgParams.pubSubInstance;
                    graphqlSchemaDeclaration = {
                        job: (0, job_1["default"])(types, models, pubSub, onJobFail),
                        batch: (0, batch_1["default"])(types, models),
                        pipeline: (0, pipeline_1["default"])(types, models),
                        pipelineStep: (0, pipelineStep_1["default"])(types, models),
                        jobHoldType: (0, jobHoldType_1["default"])(types, models),
                        workerMonitoring: (0, workerMonitoring_1["default"])(types, models, pubSub)
                    };
                    return [2 /*return*/, (0, graphql_sequelize_generator_1.generateApolloServer)(__assign({ graphqlSchemaDeclaration: graphqlSchemaDeclaration, types: types, models: models, globalPreCallback: function () { }, wsServer: wsServer, apolloServerOptions: {
                                playground: true,
                                //context: addDataloaderContext,
                                //   extensions: [
                                //     () => new WebTransactionExtension(),
                                //     () => new ErrorTrackingExtension()
                                //   ],
                                // Be sure to enable tracing
                                tracing: false
                            }, customMutations: customMutations }, gsgParams))];
            }
        });
    });
}
exports["default"] = getApolloServer;
