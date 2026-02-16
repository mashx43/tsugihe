import type { JSX } from "solid-js";
import { formatKey } from "@/hooks/useKeySettings";

interface KeyRecordingButtonProps {
	label: string;
	isRecording: boolean;
	value: string | undefined;
	onRecordStart: () => void;
}

export function KeyRecordingButton(
	props: KeyRecordingButtonProps,
): JSX.Element {
	return (
		<div class="form-control">
			<div class="label">
				<span class="label-text">{props.label}</span>
			</div>
			<button
				type="button"
				class={`btn btn-outline w-full ${props.isRecording ? "btn-primary" : ""}`}
				onClick={props.onRecordStart}
			>
				{props.isRecording ? i18n.t("press_key_hint") : formatKey(props.value)}
			</button>
		</div>
	);
}
