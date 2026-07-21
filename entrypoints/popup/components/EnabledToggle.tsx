import type { JSX } from "solid-js";
import { i18n } from "#imports";

interface Props {
	hostname: string;
	enabled: boolean | undefined;
	onToggle: () => void;
}

export function EnabledToggle(props: Props): JSX.Element {
	return (
		<div class="card border border-base-300 bg-base-200 shadow-xl">
			<div class="card-body p-4">
				<div class="form-control">
					<label class="label w-full justify-between gap-2">
						<div class="flex flex-col overflow-hidden">
							<span class="label-text text-base-content">
								{i18n.t("enabled_toggle_label")}
							</span>
							<span class="truncate text-xs opacity-50">{props.hostname}</span>
						</div>
						<input
							type="checkbox"
							class="toggle toggle-primary"
							checked={props.enabled ?? true}
							onChange={props.onToggle}
						/>
					</label>
				</div>
			</div>
		</div>
	);
}
