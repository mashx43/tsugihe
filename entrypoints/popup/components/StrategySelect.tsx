import type { JSX } from "solid-js";
import { i18n } from "#imports";
import type { DomainStrategy } from "@/utils/navigation_strategies";

interface Props {
	hostname: string;
	strategy: DomainStrategy | undefined;
	onStrategyChange: (strategy: DomainStrategy) => void;
}

const STRATEGY_OPTIONS: DomainStrategy[] = [
	"all",
	"disabled",
	"pattern",
	"relnext",
	"lookup",
];

export function StrategySelect(props: Props): JSX.Element {
	function handleChange(e: Event & { currentTarget: HTMLSelectElement }) {
		const val = e.currentTarget.value as DomainStrategy;
		props.onStrategyChange(val);
	}

	return (
		<div class="card border border-base-300 bg-base-200 shadow-xl">
			<div class="card-body p-4">
				<span class="font-bold opacity-70">{i18n.t("navigation")}</span>
				<select
					class="select select-sm w-full"
					value={props.strategy ?? "all"}
					onChange={handleChange}
				>
					{STRATEGY_OPTIONS.map((opt) => (
						<option value={opt}>
							{i18n.t(`strategy_${opt}` as Parameters<typeof i18n.t>[0])}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
