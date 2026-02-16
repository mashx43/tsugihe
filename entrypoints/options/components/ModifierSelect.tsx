import { For, type JSX } from "solid-js";
import { MODIFIER_LABELS } from "@/hooks/useKeySettings";
import type { ModifierKey } from "@/utils/storage";

interface ModifierSelectProps {
	value: ModifierKey | undefined;
	onChange: (value: ModifierKey) => void;
	isMac: boolean;
}

export function ModifierSelect(props: ModifierSelectProps): JSX.Element {
	return (
		<label class="form-control">
			<div class="label">
				<span class="label-text">{i18n.t("modifier_key_label")}</span>
			</div>
			<select
				class="select w-full"
				value={props.value ?? "none"}
				onChange={(e) => props.onChange(e.currentTarget.value as ModifierKey)}
			>
				<option value="none">{i18n.t("none")}</option>
				<For
					each={Object.entries(
						MODIFIER_LABELS[props.isMac ? "mac" : "windows"],
					)}
				>
					{([key, label]) => <option value={key}>{label}</option>}
				</For>
			</select>
		</label>
	);
}
