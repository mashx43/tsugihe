import { createSignal } from "solid-js";
import { i18n } from "#imports";
import { isModifierKey } from "@/utils/keyboard";

interface UseKeyRecorderProps {
	updateNextKey: (key: string) => Promise<void>;
	updatePrevKey: (key: string) => Promise<void>;
}

export function useKeyRecorder(props: UseKeyRecorderProps) {
	const [isRecording, setIsRecording] = createSignal<"next" | "prev" | null>(
		null,
	);
	const [error, setError] = createSignal<string | null>(null);

	const handleKeyDown = (e: KeyboardEvent) => {
		const target = isRecording();
		if (!target) return;

		e.preventDefault();
		e.stopPropagation();

		// Check if only modifier key is pressed
		if (isModifierKey(e.key)) {
			setError(i18n.t("error_modifier_key"));
			setTimeout(() => setError(null), 3000);
			return;
		}

		if (target === "next") {
			props.updateNextKey(e.key);
		} else if (target === "prev") {
			props.updatePrevKey(e.key);
		}

		setIsRecording(null);
		setError(null);
	};

	return {
		isRecording,
		setIsRecording,
		error,
		handleKeyDown,
	};
}
