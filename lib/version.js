"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidVersion = isValidVersion;
exports.isVersionSatisfied = isVersionSatisfied;
var semver_1 = __importDefault(require("semver"));
/**
 * Versions follow the Semantic Versioning specification (https://semver.org),
 * for example "5.2.0", "v5.2.0" or "5.2.0-rc.1".
 */
function isValidVersion(version) {
    return typeof version === 'string' && semver_1.default.valid(version) !== null;
}
/**
 * Tells if a worker running `workerVersion` can process a job requiring
 * `requiredMinimumVersion`. Versions are compared with the semver precedence,
 * so 1.9.0 < 1.10.0 and 2.0.0-rc.1 < 2.0.0.
 */
function isVersionSatisfied(workerVersion, requiredMinimumVersion) {
    return (isValidVersion(workerVersion) &&
        isValidVersion(requiredMinimumVersion) &&
        semver_1.default.gte(workerVersion, requiredMinimumVersion));
}
