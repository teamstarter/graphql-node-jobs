"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ponged = ponged;
var graphql_1 = require("graphql");
var type_1 = require("../type");
function ponged(pubSubInstance) {
    return {
        type: new graphql_1.GraphQLList(type_1.workerInfoOutputType),
        description: 'Ponged the server.',
        args: {},
        subscribe: function () { return pubSubInstance.asyncIterator('Ponged'); },
    };
}
