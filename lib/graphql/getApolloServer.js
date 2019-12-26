"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var graphql_sequelize_generator_1 = require("graphql-sequelize-generator");
var models_1 = __importDefault(require("../models"));
var job_1 = __importDefault(require("./job"));
var batch_1 = __importDefault(require("./batch"));
var pipeline_1 = __importDefault(require("./pipeline"));
exports["default"] = (function (dbConfig) {
    var models = models_1["default"](dbConfig);
    var types = graphql_sequelize_generator_1.generateModelTypes(models);
    var graphqlSchemaDeclaration = {
        job: job_1["default"](types),
        batch: batch_1["default"](types),
        pipeline: pipeline_1["default"](types)
    };
    return graphql_sequelize_generator_1.generateApolloServer({
        graphqlSchemaDeclaration: graphqlSchemaDeclaration,
        types: types,
        models: models,
        globalPreCallback: function () { },
        apolloServerOptions: {
            playground: true,
            //context: addDataloaderContext,
            //   extensions: [
            //     () => new WebTransactionExtension(),
            //     () => new ErrorTrackingExtension()
            //   ],
            // Be sure to enable tracing
            tracing: true
        },
        customMutations: {}
    });
});
