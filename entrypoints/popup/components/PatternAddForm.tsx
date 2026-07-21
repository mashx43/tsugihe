import { createSignal, type JSX } from "solid-js";
import { i18n } from "#imports";

interface Props {
	patterns: string[] | undefined;
	onUpdatePatterns: (value: string[]) => void;
}

export function PatternAddForm(props: Props): JSX.Element {
	const [newPattern, setNewPattern] = createSignal("");

	function addPattern(pattern: string) {
		const current = props.patterns ?? [];
		props.onUpdatePatterns([...current, pattern]);
	}

	function handleSubmit() {
		const pattern = newPattern().trim();
		if (pattern) {
			addPattern(pattern);
			setNewPattern("");
		}
	}

	return (
		<div class="flex flex-col gap-2">
			<textarea
				class="textarea textarea-xs field-sizing-content min-h-0 leading-tight"
				placeholder="example.com/pages/(\d+)"
				value={newPattern()}
				onInput={(e) => setNewPattern(e.currentTarget.value)}
			/>
			<button
				type="button"
				class="btn btn-sm btn-primary"
				onClick={handleSubmit}
				disabled={!newPattern().trim()}
			>
				{i18n.t("add")}
			</button>
		</div>
	);
}
