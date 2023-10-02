"use strict";
exports.__esModule = true;
exports.successType = exports.workerInfoOutputType = exports.workerInfoInputType = void 0;
var graphql_1 = require("graphql");
exports.workerInfoInputType = new graphql_1.GraphQLInputObjectType({
    name: 'workerInfoInput',
    fields: {
        workerId: { type: graphql_1.GraphQLString },
        workerType: { type: graphql_1.GraphQLString },
        workerStatus: { type: graphql_1.GraphQLString }
    }
});
exports.workerInfoOutputType = new graphql_1.GraphQLObjectType({
    name: 'workerInfoOutput',
    fields: {
        workerId: { type: graphql_1.GraphQLString },
        workerType: { type: graphql_1.GraphQLString },
        workerStatus: { type: graphql_1.GraphQLString }
    }
});
exports.successType = new graphql_1.GraphQLObjectType({
    name: 'success',
    fields: {
        success: { type: graphql_1.GraphQLBoolean }
    }
});
