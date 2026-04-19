import {
	findNext,
	findNextByUrl,
	findPrev,
	findPrevByUrl,
	type NavigationResult,
} from "@mash43/relnext";
import {
	getDomainEnabled,
	getDomainPatterns,
	getModifierKey,
	getNextKey,
	getPrevKey,
	type ModifierKey,
} from "@/utils/storage";
import { getTargetUrlByPattern, isSameUrl } from "@/utils/url";

const RECENT_NAVIGATIONS_KEY = "tsugihe:recent_navigations";
const HISTORY_DIRECTION_KEY = "tsugihe:history_direction";

const INTERACTIVE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const INTERACTIVE_ROLES = new Set([
	"textbox",
	"searchbox",
	"combobox",
	"slider",
	"rating",
	"spinbutton",
	"switch",
	"radio",
]);

interface NavState {
	nextUrl?: string;
	prevUrl?: string;
}

type Direction = "next" | "prev";

interface NavigationConfig {
	direction: Direction;
	historyFn: () => void;
	findFn: (html: string, url: string) => NavigationResult | null;
	findByUrlFn: (url: string) => Promise<string | undefined | null>;
}

const NAVIGATION_CONFIGS: Record<Direction, NavigationConfig> = {
	next: {
		direction: "next",
		historyFn: () => window.history.forward(),
		findFn: findNext,
		findByUrlFn: findNextByUrl,
	},
	prev: {
		direction: "prev",
		historyFn: () => window.history.back(),
		findFn: findPrev,
		findByUrlFn: findPrevByUrl,
	},
};

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
 * Normalizes a URL for use as a key in the navigation state.
 */
function normalizeUrl(urlStr: string | undefined | null): string {
	if (!urlStr) return "";
	try {
		const url = new URL(urlStr, window.location.href);
		return url.origin + url.pathname.replace(/\/$/, "") + url.search;
	} catch {
		return urlStr ?? "";
	}
}

/**
 * Records a navigation between two URLs.
 */
function recordNavigation(
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
 * Determines whether the element is an interactive input element.
 */
function isInteractiveElement(el: HTMLElement): boolean {
	return (
		INTERACTIVE_TAGS.has(el.tagName) ||
		el.isContentEditable ||
		INTERACTIVE_ROLES.has(el.getAttribute("role") ?? "")
	);
}

/**
 * Determines whether the modifier key state matches the settings.
 */
function isModifierMatch(event: KeyboardEvent, modifier: ModifierKey): boolean {
	if (modifier === "none") {
		return !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
	}
	return (
		(modifier === "alt" && event.altKey) ||
		(modifier === "ctrl" && event.ctrlKey) ||
		(modifier === "meta" && event.metaKey) ||
		(modifier === "shift" && event.shiftKey)
	);
}

/**
 * Executes the navigation. Clicks the element if it exists, otherwise updates the URL.
 */
function performNavigation(url: string, direction: Direction): void {
	const currentUrl = window.location.href;
	const absoluteUrl = new URL(url, currentUrl).href;

	recordNavigation(currentUrl, absoluteUrl, direction);

	const links = Array.from(
		document.querySelectorAll<HTMLAnchorElement>("a[href]"),
	);
	const targetLink = links.find((a) => isSameUrl(a.href, absoluteUrl));

	if (targetLink) {
		targetLink.click();
	} else {
		window.location.href = absoluteUrl;
	}
}

/**
 * Navigates in the specified direction.
 */
async function navigate(config: NavigationConfig): Promise<void> {
	const currentUrl = window.location.href;
	const currentKey = normalizeUrl(currentUrl);
	const state = getNavState();

	let targetUrl: string | undefined | null = null;

	// 1. Try to find the target URL from the current page patterns/DOM
	const host = window.location.hostname;
	const patterns = await getDomainPatterns(host);
	for (const pattern of patterns) {
		const potentialUrl = getTargetUrlByPattern(
			currentUrl,
			pattern,
			config.direction,
		);
		if (potentialUrl) {
			targetUrl = potentialUrl;
			break;
		}
	}

	if (!targetUrl) {
		const { url, selector } =
			config.findFn(document.documentElement.outerHTML, currentUrl) ?? {};
		if (url) {
			targetUrl = url;
		} else if (selector) {
			const el = document.querySelector(selector) as HTMLAnchorElement | null;
			if (el) {
				const href = el.href;
				recordNavigation(currentUrl, href, config.direction);
				el.click();
				return;
			}
		}
	}

	// 2. If not found, try to use the recorded relationship
	if (!targetUrl) {
		targetUrl =
			config.direction === "next"
				? state[currentKey]?.nextUrl
				: state[currentKey]?.prevUrl;
	}

	// 3. Last resort: try findByUrl
	if (!targetUrl) {
		targetUrl = await config.findByUrlFn(currentUrl);
	}

	if (targetUrl) {
		// Use history if it's likely to lead where we want (based on immediate previous navigation)
		const historyDir = sessionStorage.getItem(HISTORY_DIRECTION_KEY);
		if (historyDir === (config.direction === "next" ? "prev" : "next")) {
			sessionStorage.setItem(HISTORY_DIRECTION_KEY, config.direction);
			config.historyFn();
			return;
		}

		performNavigation(targetUrl, config.direction);
	}
}

export default defineContentScript({
	matches: ["<all_urls>"],
	main() {
		const historyDirection = sessionStorage.getItem(HISTORY_DIRECTION_KEY);
		if (historyDirection) {
			sessionStorage.removeItem(HISTORY_DIRECTION_KEY);
		}

		window.addEventListener("keydown", async (event) => {
			if (event.repeat) return;

			const target = event.target as HTMLElement;
			if (isInteractiveElement(target)) return;

			const [enabled, modifier, nextKey, prevKey] = await Promise.all([
				getDomainEnabled(location.hostname),
				getModifierKey(),
				getNextKey(),
				getPrevKey(),
			]);
			if (!enabled || !isModifierMatch(event, modifier)) return;

			if (event.key === nextKey) {
				event.preventDefault();
				await navigate(NAVIGATION_CONFIGS.next);
			} else if (event.key === prevKey) {
				event.preventDefault();
				await navigate(NAVIGATION_CONFIGS.prev);
			}
		});
	},
});
