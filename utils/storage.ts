import type { ModifierKey } from "@/utils/keyboard";

const KEY_ENABLED = "local:enabled";
const KEY_URL_PATTERNS = "local:url_patterns";
const KEY_MODIFIER_KEY = "local:modifier_key";
const KEY_NEXT_KEY = "local:next_key";
const KEY_PREV_KEY = "local:prev_key";

type StorageKey =
	| typeof KEY_ENABLED
	| typeof KEY_URL_PATTERNS
	| typeof KEY_MODIFIER_KEY
	| typeof KEY_NEXT_KEY
	| typeof KEY_PREV_KEY;

/**
 * Gets a value from storage for the specified key.
 * If the value is not found, returns an empty object.
 */
async function getStorage<T extends Record<string, unknown>>(
	key: StorageKey,
): Promise<T> {
	return (await storage.getItem<T>(key)) ?? ({} as T);
}

/**
 * Gets the enabled/disabled state for the specified host
 */
export async function getDomainEnabled(host: string): Promise<boolean> {
	const map = await getStorage<Record<string, boolean>>(KEY_ENABLED);
	return map[host] ?? true;
}

/**
 * Saves the enabled/disabled state for the specified host
 */
export async function setDomainEnabled(
	host: string,
	enabled: boolean,
): Promise<void> {
	const map = await getStorage<Record<string, boolean>>(KEY_ENABLED);
	await storage.setItem(KEY_ENABLED, { ...map, [host]: enabled });
}

/**
 * Gets the URL patterns for the specified host
 */
export async function getDomainPatterns(host: string): Promise<string[]> {
	const map = await getStorage<Record<string, string[]>>(KEY_URL_PATTERNS);
	return map[host] ?? [];
}

/**
 * Saves the URL patterns for the specified host
 */
export async function setDomainPatterns(
	host: string,
	patterns: string[],
): Promise<void> {
	const map = await getStorage<Record<string, string[]>>(KEY_URL_PATTERNS);
	await storage.setItem(KEY_URL_PATTERNS, { ...map, [host]: patterns });
}

/**
 * Gets the modifier key setting
 */
export async function getModifierKey(): Promise<ModifierKey> {
	return (await storage.getItem<ModifierKey>(KEY_MODIFIER_KEY)) ?? "none";
}

/**
 * Saves the modifier key setting
 */
export async function setModifierKey(key: ModifierKey): Promise<void> {
	await storage.setItem(KEY_MODIFIER_KEY, key);
}

/**
 * Gets the next key setting
 */
export async function getNextKey(): Promise<string> {
	return (await storage.getItem<string>(KEY_NEXT_KEY)) ?? "ArrowRight";
}

/**
 * Saves the next key setting
 */
export async function setNextKey(key: string): Promise<void> {
	await storage.setItem(KEY_NEXT_KEY, key);
}

/**
 * Gets the prev key setting
 */
export async function getPrevKey(): Promise<string> {
	return (await storage.getItem<string>(KEY_PREV_KEY)) ?? "ArrowLeft";
}

/**
 * Saves the prev key setting
 */
export async function setPrevKey(key: string): Promise<void> {
	await storage.setItem(KEY_PREV_KEY, key);
}

/**
 * Gets all domains where enabled is false
 */
export async function getDisabledDomains(): Promise<string[]> {
	const map = await getStorage<Record<string, boolean>>(KEY_ENABLED);
	const results: string[] = [];
	for (const [host, enabled] of Object.entries(map)) {
		if (!enabled) {
			results.push(host);
		}
	}
	return results;
}

/**
 * Sets the disabled domains list, replacing the entire enabled map
 */
export async function setDisabledDomains(domains: string[]): Promise<void> {
	const map: Record<string, boolean> = {};
	for (const domain of domains) {
		const trimmed = domain.trim();
		if (trimmed) {
			map[trimmed] = false;
		}
	}
	await storage.setItem(KEY_ENABLED, map);
}
