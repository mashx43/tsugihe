import { normalizeUrl } from "@/utils/url";

const RECENT_NAVIGATIONS_KEY = "tsugihe:recent_navigations";
const HISTORY_DIRECTION_KEY = "tsugihe:history_direction";

export type Direction = "next" | "prev";

interface NavState {
	nextUrl?: string;
	prevUrl?: string;
}

/**
 * Gets the navigation state from session storage.
 */
function getNavState(): Record<string, NavState> {
	try {
		return JSON.parse(sessionStorage.getItem(RECENT_NAVIGATIONS_KEY) ?? "{}");
	} catch {
		return {};
	}
}

/**
 * Saves the navigation state to session storage.
 */
function saveNavState(state: Record<string, NavState>): void {
	sessionStorage.setItem(RECENT_NAVIGATIONS_KEY, JSON.stringify(state));
}

/**
 * Records a navigation between two URLs.
 */
export function recordNavigation(
	fromUrl: string,
	toUrl: string,
	direction: Direction,
): void {
	const fromKey = normalizeUrl(fromUrl);
	const toKey = normalizeUrl(toUrl);
	if (!fromKey || !toKey || fromKey === toKey) return;

	const state = getNavState();
	if (!state[fromKey]) state[fromKey] = {};
	if (!state[toKey]) state[toKey] = {};

	if (direction === "next") {
		state[fromKey].nextUrl = toKey;
		state[toKey].prevUrl = fromKey;
	} else {
		state[fromKey].prevUrl = toKey;
		state[toKey].nextUrl = fromKey;
	}
	saveNavState(state);
}

/**
 * Gets the recorded target URL for a direction.
 */
export function getRecordedUrl(
	currentUrl: string,
	direction: Direction,
): string | undefined {
	const currentKey = normalizeUrl(currentUrl);
	const state = getNavState();
	return direction === "next"
		? state[currentKey]?.nextUrl
		: state[currentKey]?.prevUrl;
}

/**
 * Gets the last navigation direction.
 */
export function getHistoryDirection(): string | null {
	return sessionStorage.getItem(HISTORY_DIRECTION_KEY);
}

/**
 * Sets the last navigation direction.
 */
export function setHistoryDirection(direction: Direction): void {
	sessionStorage.setItem(HISTORY_DIRECTION_KEY, direction);
}

/**
 * Clears the history direction if it exists.
 */
export function clearHistoryDirection(): void {
	if (sessionStorage.getItem(HISTORY_DIRECTION_KEY)) {
		sessionStorage.removeItem(HISTORY_DIRECTION_KEY);
	}
}
