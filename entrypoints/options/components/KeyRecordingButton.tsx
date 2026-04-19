import type { JSX } from "solid-js";
import { FormField } from "@/components/ui/FormField";
import { formatKey } from "@/utils/keyboard";

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
		<FormField label={props.label}>
			<button
				type="button"
				class={`btn btn-outline w-full ${props.isRecording ? "btn-primary" : ""}`}
				onClick={props.onRecordStart}
			>
				{props.isRecording ? i18n.t("press_key_hint") : formatKey(props.value)}
			</button>
		</FormField>
	);
}
