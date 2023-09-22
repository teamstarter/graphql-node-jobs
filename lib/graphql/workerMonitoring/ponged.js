"use strict";
exports.__esModule = true;
exports.ponged = void 0;
var graphql_1 = require("graphql");
var pongedType = new graphql_1.GraphQLObjectType({
    name: 'ponged',
    fields: {
        success: { type: graphql_1.GraphQLBoolean }
    }
});
function ponged(pubSubInstance) {
    return {
        type: pongedType,
        description: 'Pong the server.',
        args: {},
        subscribe: function () { return pubSubInstance.asyncIterator('Ponged'); }
    };
}
exports.ponged = ponged;
