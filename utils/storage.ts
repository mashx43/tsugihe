import { storage } from "#imports";
import type { ModifierKey } from "@/utils/keyboard";
import type { DomainStrategy } from "@/utils/navigation_strategies";

export type { DomainStrategy };

const KEY_URL_PATTERNS = "local:url_patterns";
const KEY_MODIFIER_KEY = "local:modifier_key";
const KEY_NEXT_KEY = "local:next_key";
const KEY_PREV_KEY = "local:prev_key";
export const KEY_STRATEGY = "local:strategy";

type StorageKey =
	| typeof KEY_URL_PATTERNS
	| typeof KEY_MODIFIER_KEY
	| typeof KEY_NEXT_KEY
	| typeof KEY_PREV_KEY
	| typeof KEY_STRATEGY;

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
 * Gets the entire domain strategy map from storage.
 */
export function getStrategyMap(): Promise<Record<string, DomainStrategy>> {
	return getStorage<Record<string, DomainStrategy>>(KEY_STRATEGY);
}

/**
 * Gets the navigation strategy for the specified host
 */
export async function getDomainStrategy(host: string): Promise<DomainStrategy> {
	const map = await getStrategyMap();
	return map[host] ?? "all";
}

/**
 * Saves the navigation strategy for the specified host
 */
export async function setDomainStrategy(
	host: string,
	strategy: DomainStrategy,
): Promise<void> {
	const map = await getStrategyMap();
	await storage.setItem(KEY_STRATEGY, { ...map, [host]: strategy });
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
 * Gets all domains where strategy is disabled
 */
export async function getDisabledDomains(): Promise<string[]> {
	const strategyMap = await getStrategyMap();
	const disabled: string[] = [];

	for (const [host, strategy] of Object.entries(strategyMap)) {
		if (strategy === "disabled") {
			disabled.push(host);
		}
	}
	return disabled;
}

/**
 * Sets the disabled domains list
 */
export async function setDisabledDomains(domains: string[]): Promise<void> {
	const strategyMap = await getStrategyMap();
	const updatedStrategyMap: Record<string, DomainStrategy> = {
		...strategyMap,
	};

	for (const [host, strategy] of Object.entries(updatedStrategyMap)) {
		if (strategy === "disabled") {
			updatedStrategyMap[host] = "all";
		}
	}

	for (const domain of domains) {
		const trimmed = domain.trim();
		if (trimmed) {
			updatedStrategyMap[trimmed] = "disabled";
		}
	}
	await storage.setItem(KEY_STRATEGY, updatedStrategyMap);
}
