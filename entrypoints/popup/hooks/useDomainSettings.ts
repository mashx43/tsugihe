import { canIExtend } from "@mash43/can-i-extend";
import { createMemo, createResource } from "solid-js";
import {
	getDomainEnabled,
	getDomainPatterns,
	setDomainEnabled,
	setDomainPatterns,
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

	// Resource for enable/disable state
	const [enabled, { mutate: mutateEnabled }] = createResource(
		hostname,
		async (host) => {
			if (!host) return true;
			return await getDomainEnabled(host);
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

	async function toggleEnabled() {
		const host = hostname();
		const currentValue = enabled();
		if (!host || currentValue === undefined) return;

		const newValue = !currentValue;
		mutateEnabled(newValue);
		await setDomainEnabled(host, newValue);
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
		enabled,
		patterns,
		toggleEnabled,
		updatePatterns,
	};
}
