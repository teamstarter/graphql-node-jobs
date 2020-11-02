"use strict";
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
}
function getModels(dbConfig) {
    if (!db) {
        initDb(dbConfig);
    }
    return db;
}
exports["default"] = getModels;
