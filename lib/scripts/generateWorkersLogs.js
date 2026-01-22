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
exports.generateWorkersLogs = generateWorkersLogs;
var generateJobs_1 = require("./generateJobs");
var date_fns_1 = require("date-fns"); // import date-fns pour manipuler facilement les dates
var workerTypes = [
    'api-heavy-worker',
    'statistics-heavy-worker',
    'cron-heavy-worker',
    'cpu-heavy-worker',
    'puppeteer-worker',
];
var workerStatus = ['AVAILABLE', 'PROCESSING', 'FAILED', 'EXITED'];
var workerId = [
    '6fd6ad6b-bd61-4e69-87cc-b6c77cd710a5',
    'c4f3d11c-7294-4a51-9181-5366f61755bb',
    '1b70d1d1-82eb-4ea1-ac4d-bb6be63c4e9e',
    'd59dd969-2747-4eee-806b-14a9118bc60b',
    '2c8af43f-4d80-42e4-9e33-aa67dbef1caf',
];
var fakeJobs = [];
function generateWorkersLogs(models, nbHours) {
    return __awaiter(this, void 0, void 0, function () {
        var now, startDateTime, hour, currentHourDateTime, _loop_1, minute;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, models.workerMonitoring.destroy({ where: {}, force: true })];
                case 1:
                    _a.sent();
                    now = new Date();
                    startDateTime = (0, date_fns_1.subHours)(now, nbHours);
                    for (hour = 0; hour < nbHours; hour++) {
                        currentHourDateTime = (0, date_fns_1.addHours)(startDateTime, hour);
                        _loop_1 = function (minute) {
                            var currentMinuteDateTime = (0, date_fns_1.setMinutes)(currentHourDateTime, minute);
                            var finalDateTime = (0, date_fns_1.setSeconds)(currentMinuteDateTime, 0);
                            workerTypes.map(function (workerType, index) {
                                fakeJobs.push({
                                    workerId: workerId[index],
                                    workerType: workerType,
                                    workerStatus: workerStatus[(0, generateJobs_1.getRandomInt)(0, 3)],
                                    createdAt: finalDateTime,
                                    updatedAt: finalDateTime,
                                });
                            });
                        };
                        for (minute = 0; minute < 60; minute++) {
                            _loop_1(minute);
                        }
                    }
                    return [4 /*yield*/, models.sequelize.queryInterface.bulkInsert('workerMonitoring', fakeJobs)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
