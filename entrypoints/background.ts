export default defineBackground(() => {
	browser.runtime.onInstalled.addListener(async (details) => {
		if (details.reason === "install") {
			const existing =
				await storage.getItem<Record<string, boolean>>("local:enabled");
			if (!existing) {
				await setDomainEnabled("www.youtube.com", false);
			}
		}
	});

	async function updateBadge(tabId: number, url?: string) {
		if (!url) return;

		try {
			const { hostname } = new URL(url);
			const enabled = await getDomainEnabled(hostname);
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
	storage.watch<Record<string, boolean>>("local:enabled", async (newMap) => {
		if (!newMap) return;

		const tabs = await browser.tabs.query({
			active: true,
			currentWindow: true,
		});
		for (const tab of tabs) {
			if (tab.id && tab.url) {
				try {
					const { hostname } = new URL(tab.url);
					const enabled = newMap[hostname] ?? true;
					if (enabled) {
						await browser.action.setBadgeText({ text: "", tabId: tab.id });
					} else {
						await browser.action.setBadgeText({ text: "OFF", tabId: tab.id });
						await browser.action.setBadgeBackgroundColor({
							color: "#5F6368",
							tabId: tab.id,
						});
					}
				} catch {
					// Ignore
				}
			}
		}
	});
});
