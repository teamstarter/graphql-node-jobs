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
var node_fetch_1 = __importDefault(require("node-fetch"));
var apollo_client_1 = require("apollo-client");
var apollo_link_http_1 = require("apollo-link-http");
var apollo_cache_inmemory_1 = require("apollo-cache-inmemory");
function getNewClient(uri, apolloClientOptions) {
    if (apolloClientOptions === void 0) { apolloClientOptions = {}; }
    var link = new apollo_link_http_1.HttpLink({
        uri: uri,
        fetch: node_fetch_1["default"]
    });
    var cache = new apollo_cache_inmemory_1.InMemoryCache();
    var client = new apollo_client_1.ApolloClient(__assign({ link: link,
        cache: cache }, apolloClientOptions));
    return client;
}
exports["default"] = getNewClient;
