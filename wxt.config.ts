import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/i18n/module", "@wxt-dev/module-solid"],
	manifest: () => ({
		permissions: ["storage", "activeTab"],
		default_locale: "en",
		author: { email: import.meta.env.WXT_EMAIL },
		homepage_url:
			"https://chromewebstore.google.com/detail/tsugihe/hcnamoeklgkaaeefpjabdnhgihpfofgl",
	}),
	vite: () => {
		return {
			plugins: [tailwindcss()],
		};
	},
});
