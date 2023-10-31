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
var client_1 = require("@apollo/client");
var cache_1 = require("@apollo/client/cache");
var subscriptions_1 = require("@apollo/client/link/subscriptions");
var graphql_ws_1 = require("graphql-ws");
var apollo_utilities_1 = require("apollo-utilities");
var ws_1 = __importDefault(require("ws"));
global.WebSocket = ws_1["default"];
function getNewClient(uri, wsUri, apolloClientOptions) {
    if (apolloClientOptions === void 0) { apolloClientOptions = {}; }
    var httpLink = (0, client_1.createHttpLink)({
        uri: uri,
        fetch: node_fetch_1["default"]
    });
    var cache = new cache_1.InMemoryCache();
    var client;
    if (typeof wsUri === 'undefined') {
        client = new client_1.ApolloClient(__assign({ ssrMode: true, link: httpLink, cache: cache }, apolloClientOptions));
        return client;
    }
    var wsLink = new subscriptions_1.GraphQLWsLink((0, graphql_ws_1.createClient)({
        url: typeof wsUri !== 'undefined'
            ? wsUri
            : uri.replace('http', 'ws').replace('3000', '8080'),
        webSocketImpl: ws_1["default"]
    }));
    var link = (0, client_1.split)(function (_a) {
        var query = _a.query;
        var definition = (0, apollo_utilities_1.getMainDefinition)(query);
        return (definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription');
    }, wsLink, httpLink);
    client = new client_1.ApolloClient(__assign({ ssrMode: true, link: link, cache: cache }, apolloClientOptions));
    return client;
}
exports["default"] = getNewClient;
