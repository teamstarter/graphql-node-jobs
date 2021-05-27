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
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var sequelize_1 = require("sequelize");
var db = null;
/**
 * In a standard project the configuration is a commited file. But here
 * you can specify it if needed. So we have to expose a getter that caches
 * the models.
 *
 * It must be noted that NJ does not support changing the models configuration
 * once the models are fetched.
 */
function initDb(config) {
    return __awaiter(this, void 0, void 0, function () {
        var basename, sequelize, connexion;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    basename = path_1["default"].basename(module.filename);
                    db = {};
                    sequelize = null;
                    if (typeof config.use_env_variable !== 'undefined' &&
                        config.use_env_variable) {
                        sequelize = new sequelize_1.Sequelize();
                    }
                    else {
                        connexion = process.env.NODE_ENV &&
                            typeof config[process.env.NODE_ENV] !== 'undefined'
                            ? config[process.env.NODE_ENV]
                            : config;
                        sequelize = new sequelize_1.Sequelize(connexion);
                    }
                    fs_1["default"].readdirSync(__dirname)
                        .filter(function (file) {
                        return (file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js');
                    })
                        .forEach(function (file) {
                        var model = require(path_1["default"].join(__dirname, file))["default"](sequelize, sequelize.DataTypes);
                        db[model.name] = model;
                    });
                    Object.keys(db).forEach(function (modelName) {
                        if (db[modelName].associate) {
                            db[modelName].associate(db);
                        }
                    });
                    db.sequelize = sequelize;
                    db.Sequelize = sequelize_1.Sequelize;
                    return [4 /*yield*/, updateJobInProcessingToFailed(db)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function updateJobInProcessingToFailed(db) {
    return __awaiter(this, void 0, void 0, function () {
        var jobs, _i, jobs_1, job;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.job.findAll({
                        where: { status: 'processing' }
                    })];
                case 1:
                    jobs = _a.sent();
                    if (!jobs) return [3 /*break*/, 5];
                    _i = 0, jobs_1 = jobs;
                    _a.label = 2;
                case 2:
                    if (!(_i < jobs_1.length)) return [3 /*break*/, 5];
                    job = jobs_1[_i];
                    return [4 /*yield*/, job.update({ status: 'failed' })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getModels(dbConfig) {
    if (!db) {
        initDb(dbConfig);
    }
    return db;
}
exports["default"] = getModels;
