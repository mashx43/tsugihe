import { storage } from "#imports";
import { getStrategyMap, KEY_STRATEGY } from "@/utils/storage";
import { isVersionLessThan } from "./version";

/**
 * Migrates legacy local:enabled settings to local:strategy format.
 */
export async function migrateLegacyEnabledSettings(
	prevVersion: string,
): Promise<void> {
	if (!isVersionLessThan(prevVersion, "1.2")) return;

	const legacyEnabled =
		await storage.getItem<Record<string, boolean>>("local:enabled");
	if (!legacyEnabled) return;

	const currentStrategyMap = await getStrategyMap();
	const updatedStrategyMap = { ...currentStrategyMap };

	for (const [host, enabled] of Object.entries(legacyEnabled)) {
		if (!enabled && !updatedStrategyMap[host]) {
			updatedStrategyMap[host] = "disabled";
		}
	}

	await storage.setItem(KEY_STRATEGY, updatedStrategyMap);
	await storage.removeItem("local:enabled");
}
