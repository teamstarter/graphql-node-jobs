"use strict";
exports.__esModule = true;
exports.pinged = void 0;
var graphql_1 = require("graphql");
var pingedType = new graphql_1.GraphQLObjectType({
    name: 'pinged',
    fields: {
        success: { type: graphql_1.GraphQLBoolean }
    }
});
function pinged(pubSubInstance) {
    return {
        type: pingedType,
        description: 'Pinged the server.',
        args: {},
        subscribe: function () { return pubSubInstance.asyncIterator('Pinged'); }
    };
}
exports.pinged = pinged;
