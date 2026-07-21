import type { JSX } from "solid-js";
import { type Browser, i18n } from "#imports";
import { PatternAddForm } from "./PatternAddForm";
import { QuickPatternRegistration } from "./QuickPatternRegistration";

interface Props {
	currentTab: Browser.tabs.Tab | null | undefined;
	patterns: string[] | undefined;
	onUpdatePatterns: (value: string[]) => void;
}

export function PatternTabs(props: Props): JSX.Element {
	return (
		<div class="tabs tabs-border">
			<input
				type="radio"
				name="pattern_tabs"
				class="tab"
				aria-label={i18n.t("simple")}
				checked
			/>
			<div class="tab-content">
				<QuickPatternRegistration
					currentTab={props.currentTab}
					patterns={props.patterns}
					onUpdatePatterns={props.onUpdatePatterns}
				/>
			</div>

			<input
				type="radio"
				name="pattern_tabs"
				class="tab"
				aria-label={i18n.t("regex")}
			/>
			<div class="tab-content">
				<PatternAddForm
					patterns={props.patterns}
					onUpdatePatterns={props.onUpdatePatterns}
				/>
			</div>
		</div>
	);
}
