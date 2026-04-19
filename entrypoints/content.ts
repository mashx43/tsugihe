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

const NAVIGATED_NEXT_URL_KEY = "tsugihe:navigated_next_url";
const NAVIGATED_PREV_URL_KEY = "tsugihe:navigated_prev_url";

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

interface NavigationConfig {
	direction: "next" | "prev";
	checkKey: string;
	historyFn: () => void;
	findFn: (html: string, url: string) => NavigationResult | null;
	findByUrlFn: (url: string) => Promise<string | undefined | null>;
	saveKey: string;
}

const NAVIGATION_CONFIGS: Record<"next" | "prev", NavigationConfig> = {
	next: {
		direction: "next",
		checkKey: NAVIGATED_PREV_URL_KEY,
		historyFn: () => window.history.forward(),
		findFn: findNext,
		findByUrlFn: findNextByUrl,
		saveKey: NAVIGATED_NEXT_URL_KEY,
	},
	prev: {
		direction: "prev",
		checkKey: NAVIGATED_NEXT_URL_KEY,
		historyFn: () => window.history.back(),
		findFn: findPrev,
		findByUrlFn: findPrevByUrl,
		saveKey: NAVIGATED_PREV_URL_KEY,
	},
};

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
 * Removes the URL stored in session storage if it differs from the current URL.
 */
function cleanupNavigatedUrl(key: string): void {
	const savedUrl = sessionStorage.getItem(key);
	if (savedUrl && !isSameUrl(savedUrl, window.location.href)) {
		sessionStorage.removeItem(key);
	}
}

/**
 * Executes the navigation. Clicks the element if it exists, otherwise updates the URL.
 */
function performNavigation(url: string, saveKey: string): void {
	const absoluteUrl = new URL(url, window.location.href).href;
	const links = Array.from(
		document.querySelectorAll<HTMLAnchorElement>("a[href]"),
	);
	const targetLink = links.find((a) => isSameUrl(a.href, absoluteUrl));

	sessionStorage.setItem(saveKey, absoluteUrl);

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
	const host = window.location.hostname;
	const navigatedUrl = sessionStorage.getItem(config.checkKey);

	// If the page is already in the history (coming from the opposite direction), use history.
	if (navigatedUrl && isSameUrl(navigatedUrl, window.location.href)) {
		sessionStorage.removeItem(config.checkKey);
		// Save the current URL so the opposite direction can be used again on the target page.
		const oppositeKey =
			config.direction === "next"
				? NAVIGATED_PREV_URL_KEY
				: NAVIGATED_NEXT_URL_KEY;
		sessionStorage.setItem(oppositeKey, window.location.href);
		config.historyFn();
		return;
	}

	const currentUrl = window.location.href;
	let targetUrl: string | undefined | null = null;

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
			el?.click();
		}
	}

	if (!targetUrl) {
		const found = await config.findByUrlFn(currentUrl);
		if (found) {
			targetUrl = found;
		}
	}

	if (targetUrl) {
		performNavigation(targetUrl, config.saveKey);
	}
}

export default defineContentScript({
	matches: ["<all_urls>"],
	main() {
		cleanupNavigatedUrl(NAVIGATED_NEXT_URL_KEY);
		cleanupNavigatedUrl(NAVIGATED_PREV_URL_KEY);

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
