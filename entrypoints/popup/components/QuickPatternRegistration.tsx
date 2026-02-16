import { For, type JSX, Show } from "solid-js";
import { generatePattern, tokenizeUrl } from "@/utils/url";

interface Props {
	currentTab: Browser.tabs.Tab | null | undefined;
	patterns: string[] | undefined;
	onUpdatePatterns: (value: string[]) => void;
}

export function QuickPatternRegistration(props: Props): JSX.Element {
	function handleAddPattern(num: string, index: number) {
		const urlStr = props.currentTab?.url;
		if (!urlStr) return;

		const generated = generatePattern(urlStr, num, index);

		if (generated) {
			const current = props.patterns ?? [];
			props.onUpdatePatterns([...current, generated]);
		}
	}

	return (
		<div class="space-y-3">
			<div class="whitespace-break break-all rounded border border-base-300 bg-base-100 p-2">
				<div class="flex flex-wrap items-center gap-y-1 text-xs">
					<Show
						when={props.currentTab?.url}
						fallback={
							<span class="italic opacity-40">{i18n.t("url_not_found")}</span>
						}
					>
						{(url) => (
							<For each={tokenizeUrl(url())}>
								{(token) => (
									<Show
										when={token.type === "number"}
										fallback={
											<span class="text-base-content/50">{token.value}</span>
										}
									>
										<button
											type="button"
											class="btn btn-xs btn-primary mx-0.5 h-4 px-1"
											onClick={() => handleAddPattern(token.value, token.index)}
										>
											{token.value}
										</button>
									</Show>
								)}
							</For>
						)}
					</Show>
				</div>
			</div>

			<p class="text-xs leading-tight opacity-60">
				{i18n.t("click_to_register")}
			</p>
		</div>
	);
}
