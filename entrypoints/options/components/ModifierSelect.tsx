import { For, type JSX } from "solid-js";
import { FormField } from "@/components/ui/FormField";
import { getModifierLabels } from "@/utils/keyboard";
import type { ModifierKey } from "@/utils/storage";

interface ModifierSelectProps {
	value: ModifierKey | undefined;
	onChange: (value: ModifierKey) => void;
	isMac: boolean;
}

export function ModifierSelect(props: ModifierSelectProps): JSX.Element {
	const labels = () => getModifierLabels(props.isMac ? "mac" : "windows");

	return (
		<FormField label={i18n.t("modifier_key_label")}>
			<select
				class="select w-full"
				value={props.value ?? "none"}
				onChange={(e) => props.onChange(e.currentTarget.value as ModifierKey)}
			>
				<option value="none">{i18n.t("none")}</option>
				<For each={Object.entries(labels())}>
					{([key, label]) => <option value={key}>{label}</option>}
				</For>
			</select>
		</FormField>
	);
}
