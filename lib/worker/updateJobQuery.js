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
var updateJobQuery = (0, graphql_tag_1["default"])(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  mutation jobUpdate($job: jobInput!) {\n    job: jobUpdate(job: $job) {\n      id\n      type\n      name\n      input\n      output\n      status\n      processingInfo\n    }\n  }\n"], ["\n  mutation jobUpdate($job: jobInput!) {\n    job: jobUpdate(job: $job) {\n      id\n      type\n      name\n      input\n      output\n      status\n      processingInfo\n    }\n  }\n"])));
exports["default"] = updateJobQuery;
var templateObject_1;
