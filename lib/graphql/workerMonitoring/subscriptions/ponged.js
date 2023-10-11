"use strict";
exports.__esModule = true;
exports.ponged = void 0;
var graphql_1 = require("graphql");
var type_1 = require("../type");
function ponged(pubSubInstance) {
    return {
        type: new graphql_1.GraphQLList(type_1.workerInfoOutputType),
        description: 'Ponged the server.',
        args: {},
        subscribe: function () { return pubSubInstance.asyncIterator('Ponged'); }
    };
}
exports.ponged = ponged;
