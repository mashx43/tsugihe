import type { JSX } from "solid-js";
import { i18n } from "#imports";

const URL_PATTERN_POPOVER_ID = "--url-pattern-popover" as const;
const URL_PATTERN_POPOVER_ANCHOR_ID = "--url-pattern-popover-anchor" as const;

export function UrlPatternHelp(): JSX.Element {
	return (
		<>
			<button
				type="button"
				aria-label={i18n.t("help")}
				class="btn btn-ghost btn-circle btn-xs"
				popoverTarget={URL_PATTERN_POPOVER_ID}
				style={{ "anchor-name": URL_PATTERN_POPOVER_ANCHOR_ID }}
			>
				<svg
					class="size-4"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 256 256"
				>
					<title>Help Icon</title>
					<path
						fill="currentColor"
						d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m16-40a8 8 0 0 1-8 8a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 8 8m-32-92a12 12 0 1 1 12 12a12 12 0 0 1-12-12"
					/>
				</svg>
			</button>
			<div
				class="dropdown card card-sm rounded-box bg-base-100 shadow-xl"
				popover
				id={URL_PATTERN_POPOVER_ID}
				style={{ "position-anchor": URL_PATTERN_POPOVER_ANCHOR_ID }}
			>
				<div
					class="card-body gap-3 text-sm"
					innerHTML={i18n.t("url_pattern_help_content")}
				/>
			</div>
		</>
	);
}
