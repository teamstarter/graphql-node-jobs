"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var graphql_tag_1 = __importDefault(require("graphql-tag"));
var listJobQuery = graphql_tag_1["default"](templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  query listJobs(\n    $where: SequelizeJSON\n    $order: String\n    $limit: Int\n    $offset: Int\n  ) {\n    jobs: job(where: $where, order: $order, limit: $limit, offset: $offset) {\n      id\n      type\n      name\n      input\n      output\n    }\n  }\n"], ["\n  query listJobs(\n    $where: SequelizeJSON\n    $order: String\n    $limit: Int\n    $offset: Int\n  ) {\n    jobs: job(where: $where, order: $order, limit: $limit, offset: $offset) {\n      id\n      type\n      name\n      input\n      output\n    }\n  }\n"])));
function listJobs(client, _a) {
    var _b = _a === void 0 ? {} : _a, where = _b.where, order = _b.order, limit = _b.limit, offset = _b.offset;
    var variables = {};
    if (where) {
        variables.where = where;
    }
    if (order) {
        variables.order = order;
    }
    if (limit) {
        variables.limit = limit;
    }
    if (offset) {
        variables.offset = offset;
    }
    return client.query({
        query: listJobQuery,
        variables: variables
    });
}
exports["default"] = listJobs;
var templateObject_1;
