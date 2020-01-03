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
var graphql_sequelize_generator_1 = require("graphql-sequelize-generator");
var models_1 = __importDefault(require("../models"));
var job_1 = __importDefault(require("./job"));
var batch_1 = __importDefault(require("./batch"));
var pipeline_1 = __importDefault(require("./pipeline"));
/**
 * @param dbConfig Sequelize database configuration object
 * @param gsgParams Params from graphql-sequelize-generator that overwrite the default ones.
 */
function getApolloServer(dbConfig, gsgParams) {
    if (gsgParams === void 0) { gsgParams = {}; }
    var models = models_1["default"](dbConfig);
    var types = graphql_sequelize_generator_1.generateModelTypes(models);
    var graphqlSchemaDeclaration = {
        job: job_1["default"](types, models),
        batch: batch_1["default"](types, models),
        pipeline: pipeline_1["default"](types, models)
    };
    return graphql_sequelize_generator_1.generateApolloServer(__assign({ graphqlSchemaDeclaration: graphqlSchemaDeclaration,
        types: types,
        models: models, globalPreCallback: function () { }, apolloServerOptions: {
            playground: true,
            //context: addDataloaderContext,
            //   extensions: [
            //     () => new WebTransactionExtension(),
            //     () => new ErrorTrackingExtension()
            //   ],
            // Be sure to enable tracing
            tracing: false
        }, customMutations: {} }, gsgParams));
}
exports["default"] = getApolloServer;
