import {
	findNext,
	findNextByUrl,
	findPrev,
	findPrevByUrl,
	type NavigationResult,
} from "@mash43/relnext";
import { defineContentScript } from "#imports";
import { clickLinkByUrl, isInteractiveElement } from "@/utils/dom";
import { isModifierMatch } from "@/utils/keyboard";
import {
	clearHistoryDirection,
	type Direction,
	getHistoryDirection,
	recordNavigation,
	setHistoryDirection,
} from "@/utils/navigation_history";
import {
	NAVIGATION_STRATEGIES,
	type NavigationContext,
} from "@/utils/navigation_strategies";
import {
	getDomainEnabled,
	getModifierKey,
	getNextKey,
	getPrevKey,
} from "@/utils/storage";

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
 * Executes the navigation. Clicks the element if it exists, otherwise updates the URL.
 */
function performNavigation(url: string, direction: Direction): void {
	const currentUrl = window.location.href;
	const absoluteUrl = new URL(url, currentUrl).href;

	recordNavigation(currentUrl, absoluteUrl, direction);

	if (!clickLinkByUrl(absoluteUrl)) {
		window.location.href = absoluteUrl;
	}
}

/**
 * Navigates in the specified direction using strategies.
 */
async function navigate(config: NavigationConfig): Promise<void> {
	const context: NavigationContext = {
		direction: config.direction,
		currentUrl: window.location.href,
		findFn: config.findFn,
		findByUrlFn: config.findByUrlFn,
	};

	let targetUrl: string | undefined | null = null;

	for (const strategy of NAVIGATION_STRATEGIES) {
		targetUrl = await strategy(context);
		if (targetUrl) break;
	}

	if (targetUrl === "CLICKED") return;

	if (targetUrl) {
		// Use history if it's likely to lead where we want
		const historyDir = getHistoryDirection();
		if (historyDir === (config.direction === "next" ? "prev" : "next")) {
			setHistoryDirection(config.direction);
			config.historyFn();
			return;
		}

		performNavigation(targetUrl, config.direction);
	}
}

export default defineContentScript({
	matches: ["<all_urls>"],
	main() {
		clearHistoryDirection();

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
