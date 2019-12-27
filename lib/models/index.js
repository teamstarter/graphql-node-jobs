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
    var basename = path_1["default"].basename(module.filename);
    db = {};
    var sequelize = null;
    if (typeof config.use_env_variable !== 'undefined' &&
        config.use_env_variable) {
        sequelize = new sequelize_1.Sequelize();
    }
    else {
        var connexion = process.env.NODE_ENV &&
            typeof config[process.env.NODE_ENV] !== 'undefined'
            ? config[process.env.NODE_ENV]
            : config;
        sequelize = new sequelize_1.Sequelize(__assign({ 
            // Use a different table name for GNJ migration.
            migrationStorage: 'sequelize', migrationStorageTableName: 'gnj_sequelize_meta' }, connexion));
    }
    fs_1["default"].readdirSync(__dirname)
        .filter(function (file) {
        return (file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js');
    })
        .forEach(function (file) {
        var model = sequelize['import'](path_1["default"].join(__dirname, file));
        db[model.name] = model;
    });
    Object.keys(db).forEach(function (modelName) {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });
    db.sequelize = sequelize;
    db.Sequelize = sequelize_1.Sequelize;
}
function getModels(dbConfig) {
    if (!db) {
        initDb(dbConfig);
    }
    return db;
}
exports["default"] = getModels;
