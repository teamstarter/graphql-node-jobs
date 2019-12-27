"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var uuid_1 = __importDefault(require("uuid"));
var debug_1 = __importDefault(require("debug"));
var apollo_client_1 = __importDefault(require("apollo-client"));
var graphql_tag_1 = __importDefault(require("graphql-tag"));
var apollo_link_http_1 = require("apollo-link-http");
var apollo_cache_inmemory_1 = require("apollo-cache-inmemory");
var unfetch_1 = __importDefault(require("unfetch"));
var debug = debug_1["default"]('graphql-node-jobs');
var loopTime = 1000;
var acquireJobQuery = graphql_tag_1["default"](templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  mutation acquireJob($type: String!, $workerId: String) {\n    job: acquireJob(type: $type, workerId: $workerId) {\n      id\n      type\n      name\n      input\n      output\n    }\n  }\n"], ["\n  mutation acquireJob($type: String!, $workerId: String) {\n    job: acquireJob(type: $type, workerId: $workerId) {\n      id\n      type\n      name\n      input\n      output\n    }\n  }\n"])));
var updateJobQuery = graphql_tag_1["default"](templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  mutation jobUpdate($job: jobInput!) {\n    job: jobUpdate(job: $job) {\n      id\n      type\n      name\n      input\n      output\n      status\n    }\n  }\n"], ["\n  mutation jobUpdate($job: jobInput!) {\n    job: jobUpdate(job: $job) {\n      id\n      type\n      name\n      input\n      output\n      status\n    }\n  }\n"])));
function checkForJobs(_a) {
    var processingFunction = _a.processingFunction, uri = _a.uri, type = _a.type, _b = _a.workerId, workerId = _b === void 0 ? undefined : _b, _c = _a.looping, looping = _c === void 0 ? true : _c;
    return __awaiter(this, void 0, void 0, function () {
        var link, cache, client, data, job, output, err_1, result, err_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!workerId) {
                        workerId = uuid_1["default"]();
                    }
                    link = new apollo_link_http_1.HttpLink({
                        uri: uri,
                        fetch: unfetch_1["default"]
                    });
                    cache = new apollo_cache_inmemory_1.InMemoryCache();
                    debug("Started worker " + workerId + " in charge of types :" + type + ".");
                    client = new apollo_client_1["default"]({
                        link: link,
                        cache: cache
                    });
                    return [4 /*yield*/, client.mutate({
                            mutation: acquireJobQuery,
                            variables: { type: type, workerId: workerId }
                        })];
                case 1:
                    data = (_d.sent()).data;
                    job = data.job;
                    if (!job) {
                        if (looping) {
                            setTimeout(checkForJobs, loopTime);
                            return [2 /*return*/, null];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                    }
                    debug('Reiceived a new job', job);
                    output = null;
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, processingFunction(job)];
                case 3:
                    output = _d.sent();
                    debug("Job's done", job.id);
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _d.sent();
                    debug('Error during the job processing', err_1);
                    return [3 /*break*/, 5];
                case 5:
                    debug('Updating job');
                    _d.label = 6;
                case 6:
                    _d.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, client.mutate({
                            mutation: updateJobQuery,
                            variables: {
                                job: {
                                    id: job.id,
                                    status: 'successful',
                                    output: JSON.stringify(output)
                                }
                            }
                        })];
                case 7:
                    result = _d.sent();
                    if (looping) {
                        return [2 /*return*/, checkForJobs({ processingFunction: processingFunction, uri: uri, type: type, workerId: workerId, looping: looping })];
                    }
                    return [2 /*return*/, result];
                case 8:
                    err_2 = _d.sent();
                    debug('Failed to update the success status of the current job.', err_2);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = checkForJobs;
var templateObject_1, templateObject_2;