import {
	createEffect,
	createResource,
	createSignal,
	onCleanup,
} from "solid-js";
import { i18n } from "#i18n";
import { storage } from "#imports";
import { FormField } from "@/components/ui/FormField";
import {
	type DomainStrategy,
	getDisabledDomains,
	KEY_STRATEGY,
	setDisabledDomains,
} from "@/utils/storage";

export function DisabledSitesEditor() {
	const [domains, { mutate }] = createResource(getDisabledDomains);
	const [localText, setLocalText] = createSignal("");
	const [isEditing, setIsEditing] = createSignal(false);

	createEffect(() => {
		const d = domains();
		if (d && !isEditing()) {
			setLocalText(d.join("\n"));
		}
	});

	const unwatch = storage.watch<Record<string, DomainStrategy>>(
		KEY_STRATEGY,
		(newMap) => {
			if (!newMap) {
				mutate([]);
				return;
			}
			const disabled: string[] = [];
			for (const [host, strategy] of Object.entries(newMap)) {
				if (strategy === "disabled") {
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
		const lines = localText().split("\n");
		const normalized = lines.map((l) => l.trim()).filter((l) => l.length > 0);

		// Update storage first
		await setDisabledDomains(normalized);

		// Optimistically update resource
		mutate(normalized);

		// Reset editing state after update completes
		setIsEditing(false);
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
