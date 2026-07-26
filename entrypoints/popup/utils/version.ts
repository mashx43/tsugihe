/**
 * Compares version strings to check if current version is less than target version.
 *
 * @param version Current version string (defaults to "1.0")
 * @param targetVersion Target version string to compare against
 * @returns True if version < targetVersion, false otherwise
 */
export function isVersionLessThan(
	version: string,
	targetVersion: string,
): boolean {
	const v1Parts = version.split(".").map(Number);
	const v2Parts = targetVersion.split(".").map(Number);

	for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
		const p1 = v1Parts[i] || 0;
		const p2 = v2Parts[i] || 0;
		if (p1 < p2) return true;
		if (p1 > p2) return false;
	}
	return false;
}
