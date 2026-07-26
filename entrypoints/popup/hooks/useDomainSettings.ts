import { canIExtend } from "@mash43/can-i-extend";
import { createMemo, createResource } from "solid-js";
import { browser } from "#imports";
import {
	type DomainStrategy,
	getDomainPatterns,
	getDomainStrategy,
	setDomainPatterns,
	setDomainStrategy,
} from "@/utils/storage";

export function useDomainSettings() {
	// Get current tab
	const [currentTab] = createResource(async () => {
		try {
			const [tab] = await browser.tabs.query({
				active: true,
				currentWindow: true,
			});
			return tab;
		} catch (_e) {
			return null;
		}
	});

	// Memoize hostname
	const hostname = createMemo(() => {
		const url = currentTab()?.url;
		if (!url || !canIExtend(url)) return null;
		try {
			return new URL(url).hostname;
		} catch {
			return null;
		}
	});

	// Resource for strategy state
	const [strategy, { mutate: mutateStrategy }] = createResource(
		hostname,
		async (host) => {
			if (!host) return "all";
			return await getDomainStrategy(host);
		},
	);

	// Resource for URL patterns
	const [patterns, { mutate: mutatePatterns }] = createResource(
		hostname,
		async (host) => {
			if (!host) return [];
			return await getDomainPatterns(host);
		},
	);

	async function updateStrategy(value: DomainStrategy) {
		const host = hostname();
		if (!host) return;

		mutateStrategy(value);
		await setDomainStrategy(host, value);
	}

	async function updatePatterns(value: string[]) {
		const host = hostname();
		if (!host) return;

		mutatePatterns(value);
		await setDomainPatterns(host, value);
	}

	return {
		currentTab,
		hostname,
		strategy,
		patterns,
		updateStrategy,
		updatePatterns,
	};
}
