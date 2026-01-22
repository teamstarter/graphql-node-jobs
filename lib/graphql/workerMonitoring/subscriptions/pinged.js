"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinged = pinged;
var type_1 = require("../type");
function pinged(pubSubInstance) {
    return {
        type: type_1.successType,
        description: 'Pinged the server.',
        args: {},
        subscribe: function () { return pubSubInstance.asyncIterator('Pinged'); },
    };
}
