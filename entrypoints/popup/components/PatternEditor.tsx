import { Index, type JSX } from "solid-js";
import { i18n } from "#imports";

interface Props {
	patterns: string[] | undefined;
	onUpdatePatterns: (value: string[]) => void;
}

export function PatternEditor(props: Props): JSX.Element {
	function updatePattern(index: number, value: string) {
		const current = props.patterns ?? [];
		const updated = [...current];
		updated[index] = value;
		props.onUpdatePatterns(updated);
	}

	function removePattern(index: number) {
		const current = props.patterns ?? [];
		const updated = current.filter((_, i) => i !== index);
		props.onUpdatePatterns(updated);
	}

	return (
		<div class="flex flex-col space-y-4">
			<div class="space-y-2">
				<Index each={props.patterns}>
					{(pattern, index) => (
						<div class="group relative w-full">
							<textarea
								class="textarea textarea-xs field-sizing-content min-h-0 leading-tight"
								spellcheck="false"
								value={pattern()}
								onInput={(e) => updatePattern(index, e.currentTarget.value)}
							/>
							<button
								type="button"
								aria-label={i18n.t("remove")}
								class="btn btn-xs btn-circle btn-ghost btn-error absolute top-1 right-1 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
								onClick={() => removePattern(index)}
							>
								<svg
									class="size-4"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 256 256"
								>
									<title>Remove Icon</title>
									<path
										fill="currentColor"
										d="M165.66 101.66L139.31 128l26.35 26.34a8 8 0 0 1-11.32 11.32L128 139.31l-26.34 26.35a8 8 0 0 1-11.32-11.32L116.69 128l-26.35-26.34a8 8 0 0 1 11.32-11.32L128 116.69l26.34-26.35a8 8 0 0 1 11.32 11.32M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88"
									/>
								</svg>
							</button>
						</div>
					)}
				</Index>
			</div>
		</div>
	);
}
