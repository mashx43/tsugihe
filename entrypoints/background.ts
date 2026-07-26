import { browser, defineBackground, storage } from "#imports";
import {
	type DomainStrategy,
	getDomainStrategy,
	KEY_STRATEGY,
	setDomainStrategy,
} from "@/utils/storage";
import { migrateLegacyEnabledSettings } from "./popup/utils/migration";

export default defineBackground(() => {
	browser.runtime.onInstalled.addListener(async (details) => {
		if (details.reason === "install") {
			await setDomainStrategy("www.youtube.com", "disabled");
		} else if (details.reason === "update") {
			if (!details.previousVersion) return;
			await migrateLegacyEnabledSettings(details.previousVersion);
		}
	});

	async function updateBadge(
		tabId: number,
		url?: string,
		strategyMap?: Record<string, DomainStrategy>,
	) {
		if (!url) return;

		try {
			const { hostname } = new URL(url);
			const strategy = strategyMap
				? (strategyMap[hostname] ?? "all")
				: await getDomainStrategy(hostname);
			const enabled = strategy !== "disabled";

			if (enabled) {
				await browser.action.setBadgeText({ text: "", tabId });
			} else {
				await browser.action.setBadgeText({ text: "OFF", tabId });
				await browser.action.setBadgeBackgroundColor({
					color: "#6b7280",
					tabId,
				});
			}
		} catch (_e) {
			// Ignore invalid URLs (e.g., chrome://)
		}
	}

	// Monitor tab updates
	browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		if (changeInfo.status === "complete") {
			updateBadge(tabId, tab.url);
		}
	});

	// Monitor tab activation
	browser.tabs.onActivated.addListener(async (activeInfo) => {
		const tab = await browser.tabs.get(activeInfo.tabId);
		updateBadge(activeInfo.tabId, tab.url);
	});

	// Monitor storage changes
	storage.watch<Record<string, DomainStrategy>>(
		KEY_STRATEGY,
		async (newMap) => {
			if (!newMap) return;

			const tabs = await browser.tabs.query({});
			for (const tab of tabs) {
				if (tab.id && tab.url) {
					updateBadge(tab.id, tab.url, newMap);
				}
			}
		},
	);
});
