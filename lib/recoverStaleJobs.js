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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.STALE_JOB_CANCEL_MESSAGE = void 0;
exports.default = recoverStaleJobs;
var sequelize_1 = require("sequelize");
var models_1 = require("./models");
exports.STALE_JOB_CANCEL_MESSAGE = 'Interrupted: the worker of the job stopped sending heartbeats.';
// The statuses in which a worker is still running the job.
var RUNNING_STATUSES = "('processing', 'cancel-requested')";
function getStaleCondition(checkJobsWithoutHeartbeat) {
    var withoutHeartbeat = checkJobsWithoutHeartbeat
        ? "OR (\"heartbeatAt\" IS NULL AND COALESCE(\"startedAt\", \"createdAt\") < :startedLimit)"
        : '';
    return "\"status\" IN ".concat(RUNNING_STATUSES, "\n    AND \"deletedAt\" IS NULL\n    AND (\n      (\"heartbeatAt\" IS NOT NULL AND \"heartbeatAt\" < :heartbeatLimit)\n      ").concat(withoutHeartbeat, "\n    )");
}
function updateStaleJobs(sequelize, set, ids, staleCondition, replacements) {
    return __awaiter(this, void 0, void 0, function () {
        var rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (ids.length === 0) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, sequelize.query("UPDATE job SET ".concat(set, "\n    WHERE id IN (:ids) AND ").concat(staleCondition, "\n    RETURNING *"), { replacements: __assign(__assign({}, replacements), { ids: ids }) })];
                case 1:
                    rows = (_a.sent())[0];
                    return [2 /*return*/, rows];
            }
        });
    });
}
/**
 * Requeues or cancels the jobs still running whose worker no longer gives
 * signs of life (a thread or a process that died, an instance replaced).
 *
 * A job is stale when its last heartbeat (job.heartbeatAt, sent by
 * checkForJobs with a heartbeatInterval) is older than `staleAfter` ms. With
 * `withoutHeartbeatStaleAfter`, a job that never sent a heartbeat (worker
 * without heartbeatInterval, or of an older version) is stale when it started
 * more than `withoutHeartbeatStaleAfter` ms ago.
 *
 * Each recovery adds 1 to job.interruptedCount, which `getAction` reads: a
 * job whose run kills its worker (out of memory, for example) would otherwise
 * be requeued and kill a worker again, forever.
 *
 * `getAction(job)` decides for each `processing` job:
 * - 'requeue': the same job goes back to `queued`, to be run again from the
 *   start (processingInfo emptied). It keeps its id, so what links to it keeps
 *   working. Only for a job that can run twice without harm;
 * - 'cancel' (default): the job ends `cancelled`, with STALE_JOB_CANCEL_MESSAGE
 *   in output.cancelMessage.
 * A stale `cancel-requested` job is always cancelled.
 *
 * onJobFail is not called: the job was interrupted, it did not fail. The
 * caller gets the recovered jobs and reports them as it wants.
 *
 * Several processes may run it at the same time: each job is recovered by one
 * of them only.
 */
function recoverStaleJobs(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var models, sequelize, now, checkJobsWithoutHeartbeat, staleCondition, replacements, staleJobs, idsToRequeue, idsToCancel, _i, staleJobs_1, job, action, _c, requeued, cancelled;
        var dbConfig = _b.dbConfig, sequelizeInstance = _b.sequelizeInstance, staleAfter = _b.staleAfter, withoutHeartbeatStaleAfter = _b.withoutHeartbeatStaleAfter, _d = _b.getAction, getAction = _d === void 0 ? function () { return 'cancel'; } : _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!(staleAfter > 0)) {
                        throw new Error('Please provide a staleAfter duration in milliseconds.');
                    }
                    return [4 /*yield*/, (0, models_1.getModelsAndInitializeDatabase)({
                            dbConfig: dbConfig,
                            sequelizeInstance: sequelizeInstance,
                        })];
                case 1:
                    models = _e.sent();
                    sequelize = models.sequelize;
                    now = new Date();
                    checkJobsWithoutHeartbeat = withoutHeartbeatStaleAfter !== undefined;
                    staleCondition = getStaleCondition(checkJobsWithoutHeartbeat);
                    replacements = __assign({ now: now, heartbeatLimit: new Date(now.getTime() - staleAfter) }, (checkJobsWithoutHeartbeat
                        ? {
                            startedLimit: new Date(now.getTime() - withoutHeartbeatStaleAfter),
                        }
                        : {}));
                    return [4 /*yield*/, sequelize.query("SELECT * FROM job WHERE ".concat(staleCondition, " ORDER BY id"), { replacements: replacements, type: sequelize_1.QueryTypes.SELECT })];
                case 2:
                    staleJobs = _e.sent();
                    idsToRequeue = [];
                    idsToCancel = [];
                    _i = 0, staleJobs_1 = staleJobs;
                    _e.label = 3;
                case 3:
                    if (!(_i < staleJobs_1.length)) return [3 /*break*/, 8];
                    job = staleJobs_1[_i];
                    if (!(job.status === 'processing')) return [3 /*break*/, 5];
                    return [4 /*yield*/, getAction(job)];
                case 4:
                    _c = _e.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _c = 'cancel';
                    _e.label = 6;
                case 6:
                    action = _c;
                    (action === 'requeue' ? idsToRequeue : idsToCancel).push(job.id);
                    _e.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [4 /*yield*/, updateStaleJobs(sequelize, "\"status\" = 'queued',\n      \"workerId\" = NULL,\n      \"startedAt\" = NULL,\n      \"heartbeatAt\" = NULL,\n      \"processingInfo\" = NULL,\n      \"interruptedCount\" = \"interruptedCount\" + 1,\n      \"updatedAt\" = :now", idsToRequeue, "\"status\" = 'processing' AND ".concat(staleCondition), replacements)];
                case 9:
                    requeued = _e.sent();
                    return [4 /*yield*/, updateStaleJobs(sequelize, "\"status\" = 'cancelled',\n      \"output\" = CAST(:output AS JSON),\n      \"cancelledAt\" = :now,\n      \"endedAt\" = :now,\n      \"interruptedCount\" = \"interruptedCount\" + 1,\n      \"updatedAt\" = :now", idsToCancel, staleCondition, __assign(__assign({}, replacements), { output: JSON.stringify({ cancelMessage: exports.STALE_JOB_CANCEL_MESSAGE }) }))];
                case 10:
                    cancelled = _e.sent();
                    return [2 /*return*/, { requeued: requeued, cancelled: cancelled }];
            }
        });
    });
}
