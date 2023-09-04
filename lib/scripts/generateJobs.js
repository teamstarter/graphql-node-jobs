"use strict";
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
exports.__esModule = true;
exports.generateJobs = void 0;
var date_fns_1 = require("date-fns");
// FUNCTIONS
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function setUpDate(startDate, i) {
    var currentDate = (0, date_fns_1.addDays)(startDate, i);
    currentDate.setUTCHours(1);
    currentDate.setUTCMinutes(0);
    currentDate.setUTCSeconds(0);
    return currentDate;
}
function generateJobs(models, nbDays, nbJobsPerDay) {
    return __awaiter(this, void 0, void 0, function () {
        var status, fakeJobs, jobID, startDate, i, currentDate, i_1, randomStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    status = [
                        'successful',
                        'failed',
                        'successful',
                        'successful',
                        'cancelled',
                        'queued',
                        'successful',
                    ];
                    fakeJobs = [];
                    jobID = 0;
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 370);
                    return [4 /*yield*/, models.job.destroy({ where: {}, force: true })];
                case 1:
                    _a.sent();
                    for (i = 0; i < nbDays; i++) {
                        currentDate = setUpDate(startDate, i);
                        for (i_1 = 0; i_1 < nbJobsPerDay; i_1++) {
                            randomStatus = status[getRandomInt(0, 6)];
                            fakeJobs.push({
                                id: jobID,
                                type: 'fakeJob',
                                status: randomStatus,
                                createdAt: currentDate,
                                updatedAt: currentDate,
                                startedAt: currentDate,
                                endedAt: randomStatus === 'failed' || randomStatus === 'successful'
                                    ? (0, date_fns_1.addHours)(currentDate, 1)
                                    : currentDate,
                                workerId: '0ab7285e-29e1-474c-889a-22891f92ab44',
                                isUpdateAlreadyCalledWhileCancelRequested: false,
                                isHighFrequency: false,
                                isRecoverable: false
                            });
                            jobID++;
                        }
                    }
                    return [4 /*yield*/, models.sequelize.queryInterface.bulkInsert('job', fakeJobs)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.generateJobs = generateJobs;
