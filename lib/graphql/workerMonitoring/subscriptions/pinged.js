"use strict";
exports.__esModule = true;
exports.pinged = void 0;
var type_1 = require("../type");
function pinged(pubSubInstance) {
    return {
        type: type_1.successType,
        description: 'Pinged the server.',
        args: {},
        subscribe: function () { return pubSubInstance.asyncIterator('Pinged'); }
    };
}
exports.pinged = pinged;
