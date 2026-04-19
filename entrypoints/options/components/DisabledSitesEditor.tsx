import {
	createEffect,
	createResource,
	createSignal,
	onCleanup,
} from "solid-js";
import { FormField } from "@/components/ui/FormField";
import { getDisabledDomains, setDisabledDomains } from "@/utils/storage";

export function DisabledSitesEditor() {
	const [domains, { mutate }] = createResource(getDisabledDomains);
	const [localText, setLocalText] = createSignal("");
	const [isEditing, setIsEditing] = createSignal(false);

	createEffect(() => {
		if (!isEditing()) {
			const d = domains();
			if (d) {
				setLocalText(d.join("\n"));
			}
		}
	});

	const unwatch = storage.watch<Record<string, boolean>>(
		"local:enabled",
		(newMap) => {
			if (!newMap) {
				mutate([]);
				return;
			}
			const disabled: string[] = [];
			for (const [host, enabled] of Object.entries(newMap)) {
				if (!enabled) {
					disabled.push(host);
				}
			}
			mutate(disabled);
		},
	);
	onCleanup(() => unwatch());

	function handleInput(e: InputEvent & { currentTarget: HTMLTextAreaElement }) {
		setLocalText(e.currentTarget.value);
	}

	function handleFocus() {
		setIsEditing(true);
	}

	async function handleBlur() {
		setIsEditing(false);
		const lines = localText().split("\n");
		const normalized = lines.map((l) => l.trim()).filter((l) => l.length > 0);

		// Update storage
		await setDisabledDomains(normalized);

		// Optimistically update the resource so the UI doesn't flicker
		mutate(normalized);
	}

	return (
		<FormField description={i18n.t("disabled_sites_description")}>
			<textarea
				class="textarea textarea-xs field-sizing-content min-h-0 w-full"
				value={localText()}
				onInput={handleInput}
				onFocus={handleFocus}
				onBlur={handleBlur}
				placeholder="example.com"
				spellcheck={false}
			/>
		</FormField>
	);
}
