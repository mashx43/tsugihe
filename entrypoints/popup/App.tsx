import { Show } from "solid-js";
import { useKeySettings } from "@/hooks/useKeySettings";
import { NotAvailable } from "./components/NotAvailable";
import { PatternEditor } from "./components/PatternEditor";
import { PatternTabs } from "./components/PatternTabs";
import { StrategySelect } from "./components/StrategySelect";
import { UrlPatternHelp } from "./components/UrlPatternHelp";
import { useDomainSettings } from "./hooks/useDomainSettings";
import "./App.css";
import { i18n } from "#imports";

function App() {
	const {
		currentTab,
		hostname,
		strategy,
		patterns,
		updateStrategy,
		updatePatterns,
	} = useDomainSettings();
	const { getHint } = useKeySettings();

	return (
		<div class="min-w-90 bg-base-100 p-4">
			<Show when={hostname()} fallback={<NotAvailable />}>
				{(hostname) => (
					<div class="space-y-6">
						<StrategySelect
							hostname={hostname()}
							strategy={strategy()}
							onStrategyChange={updateStrategy}
						/>
						<div class="card border border-base-300 bg-base-200 shadow-xl">
							<div class="card-body p-4">
								<div class="flex items-center gap-1 px-2 opacity-70">
									<span class="font-bold leading-none">
										{i18n.t("url_pattern")}
									</span>
									<UrlPatternHelp />
								</div>
								<PatternTabs
									currentTab={currentTab()}
									patterns={patterns()}
									onUpdatePatterns={updatePatterns}
								/>
								<Show when={patterns()?.length}>
									<PatternEditor
										patterns={patterns()}
										onUpdatePatterns={updatePatterns}
									/>
								</Show>
							</div>
						</div>
						<p class="text-center text-xs italic opacity-60">
							{getHint().prev} / {getHint().next}
						</p>
					</div>
				)}
			</Show>
		</div>
	);
}

export default App;
