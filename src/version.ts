import semver from 'semver'

/**
 * Versions follow the Semantic Versioning specification (https://semver.org),
 * for example "5.2.0", "v5.2.0" or "5.2.0-rc.1".
 */
export function isValidVersion(version: unknown): version is string {
  return typeof version === 'string' && semver.valid(version) !== null
}

/**
 * Tells if a worker running `workerVersion` can process a job requiring
 * `requiredMinimumVersion`. Versions are compared with the semver precedence,
 * so 1.9.0 < 1.10.0 and 2.0.0-rc.1 < 2.0.0.
 */
export function isVersionSatisfied(
  workerVersion: string,
  requiredMinimumVersion: string
): boolean {
  return (
    isValidVersion(workerVersion) &&
    isValidVersion(requiredMinimumVersion) &&
    semver.gte(workerVersion, requiredMinimumVersion)
  )
}
