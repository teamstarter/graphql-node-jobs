"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var getApolloServer_1 = __importDefault(require("./graphql/getApolloServer"));
var migrate_1 = __importDefault(require("./migrate"));
exports["default"] = { getApolloServer: getApolloServer_1["default"], migrate: migrate_1["default"] };
