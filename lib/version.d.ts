/**
 * Versions follow the Semantic Versioning specification (https://semver.org),
 * for example "5.2.0", "v5.2.0" or "5.2.0-rc.1".
 */
export declare function isValidVersion(version: unknown): version is string;
/**
 * Tells if a worker running `workerVersion` can process a job requiring
 * `requiredMinimumVersion`. Versions are compared with the semver precedence,
 * so 1.9.0 < 1.10.0 and 2.0.0-rc.1 < 2.0.0.
 */
export declare function isVersionSatisfied(workerVersion: string, requiredMinimumVersion: string): boolean;
