#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var commander_1 = __importDefault(require("commander"));
var migrate_1 = __importDefault(require("./migrate"));
var models_1 = require("./models");
var generateJobs_1 = require("./scripts/generateJobs");
var generateWorkersLogs_1 = require("./scripts/generateWorkersLogs");
commander_1["default"]
    .command('migrate <configPath>')
    .option('-d --dbhash <dbhash>', 'The database hash in case of shared database')
    .description('Migrate the database with the last schema of graphql-node-jobs. We advise to provide a separated schema.')
    .action(function (configPath, options) {
    return __awaiter(this, void 0, void 0, function () {
        var dbConfig, models;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dbConfig = null;
                    try {
                        dbConfig = require(configPath);
                    }
                    catch (e) {
                        throw new Error('Could not load the given config.' + e.message);
                    }
                    return [4 /*yield*/, (0, models_1.getModelsAndInitializeDatabase)({ dbConfig: dbConfig, dbhash: options ? options.dbhash : null })];
                case 1:
                    models = _a.sent();
                    return [4 /*yield*/, (0, migrate_1["default"])(models)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, models.sequelize.close()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
});
commander_1["default"]
    .command('seedJobs <configPath> <nbDays> <nbJobsPerDay>')
    .description('Seed the job table')
    .action(function (configPath, nbDays, nbJobsPerDay) {
    return __awaiter(this, void 0, void 0, function () {
        var dbConfig, models;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (process.env.NODE_ENV !== 'development') {
                        throw new Error('This command is only available in development mode');
                    }
                    dbConfig = null;
                    try {
                        dbConfig = require(configPath);
                    }
                    catch (e) {
                        throw new Error('Could not load the given config.' + e.message);
                    }
                    return [4 /*yield*/, (0, models_1.getModelsAndInitializeDatabase)({ dbConfig: dbConfig })];
                case 1:
                    models = _a.sent();
                    return [4 /*yield*/, (0, generateJobs_1.generateJobs)(models, nbDays, nbJobsPerDay)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, models.sequelize.close()];
                case 3:
                    _a.sent();
                    console.log('Seeding Done');
                    return [2 /*return*/];
            }
        });
    });
});
commander_1["default"]
    .command('seedWorkerLogs <configPath> <nbHours>')
    .description('Seed the workerMonitoring table')
    .action(function (configPath, nbHours) {
    return __awaiter(this, void 0, void 0, function () {
        var dbConfig, models;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (process.env.NODE_ENV !== 'development') {
                        throw new Error('This command is only available in development mode');
                    }
                    dbConfig = null;
                    try {
                        dbConfig = require(configPath);
                    }
                    catch (e) {
                        throw new Error('Could not load the given config.' + e.message);
                    }
                    return [4 /*yield*/, (0, models_1.getModelsAndInitializeDatabase)({ dbConfig: dbConfig })];
                case 1:
                    models = _a.sent();
                    return [4 /*yield*/, (0, generateWorkersLogs_1.generateWorkersLogs)(models, nbHours)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, models.sequelize.close()];
                case 3:
                    _a.sent();
                    console.log('Seeding Done');
                    return [2 /*return*/];
            }
        });
    });
});
commander_1["default"].command('help', 'Display the help');
commander_1["default"].parse(process.argv);
