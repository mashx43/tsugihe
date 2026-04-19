import type { NavigationResult } from "@mash43/relnext";
import {
	type Direction,
	getRecordedUrl,
	recordNavigation,
} from "@/utils/navigation_history";
import { getDomainPatterns } from "@/utils/storage";
import { getTargetUrlByPattern } from "@/utils/url";

export interface NavigationContext {
	direction: Direction;
	currentUrl: string;
	findFn: (html: string, url: string) => NavigationResult | null;
	findByUrlFn: (url: string) => Promise<string | undefined | null>;
}

export type NavigationStrategy = (
	context: NavigationContext,
) => Promise<string | undefined | null>;

/**
 * Strategy that uses domain-specific regex patterns.
 */
export const patternStrategy: NavigationStrategy = async (ctx) => {
	const host = new URL(ctx.currentUrl).hostname;
	const patterns = await getDomainPatterns(host);
	for (const pattern of patterns) {
		const potentialUrl = getTargetUrlByPattern(
			ctx.currentUrl,
			pattern,
			ctx.direction,
		);
		if (potentialUrl) return potentialUrl;
	}
	return null;
};

/**
 * Strategy that uses DOM-based discovery (relnext).
 */
export const relNextStrategy: NavigationStrategy = async (ctx) => {
	const { url, selector } =
		ctx.findFn(document.documentElement.outerHTML, ctx.currentUrl) ?? {};
	if (url) return url;
	if (selector) {
		const el = document.querySelector(selector) as HTMLAnchorElement | null;
		if (el) {
			const href = el.href;
			recordNavigation(ctx.currentUrl, href, ctx.direction);
			el.click();
			return "CLICKED"; // Special value indicating link was clicked
		}
	}
	return null;
};

/**
 * Strategy that uses recorded session history.
 */
export const historyStrategy: NavigationStrategy = async (ctx) => {
	return getRecordedUrl(ctx.currentUrl, ctx.direction);
};

/**
 * Strategy that uses URL-based lookup (relnext).
 */
export const lookupStrategy: NavigationStrategy = async (ctx) => {
	return await ctx.findByUrlFn(ctx.currentUrl);
};

/**
 * The ordered list of strategies to try.
 */
export const NAVIGATION_STRATEGIES: NavigationStrategy[] = [
	patternStrategy,
	relNextStrategy,
	historyStrategy,
	lookupStrategy,
];
