export const MODIFIER_LABELS = {
	mac: {
		alt: "Option (⌥)",
		ctrl: "Control (⌃)",
		meta: "Command (⌘)",
		shift: "Shift (⇧)",
	},
	windows: {
		alt: "Alt",
		ctrl: "Ctrl",
		meta: "Win",
		shift: "Shift",
	},
} as const;

export type ModifierKey = "none" | "alt" | "ctrl" | "meta" | "shift";

/**
 * Gets the modifier labels for the specified OS.
 */
export function getModifierLabels(os: string | undefined) {
	const platform = os === "mac" ? "mac" : "windows";
	return MODIFIER_LABELS[platform];
}

/**
 * Determines whether the key is a modifier key.
 */
export function isModifierKey(key: string): boolean {
	return ["Alt", "Control", "Meta", "Shift"].includes(key);
}

/**
 * Formats a key name for display.
 */
export function formatKey(key: string | undefined): string {
	if (!key) return "";
	if (key === " ") return "Space";
	if (key.length === 1) return key.toUpperCase();
	return key;
}

/**
 * Determines whether the modifier key state matches the settings.
 */
export function isModifierMatch(
	event: KeyboardEvent,
	modifier: ModifierKey,
): boolean {
	if (modifier === "none") {
		return !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
	}
	return (
		(modifier === "alt" && event.altKey) ||
		(modifier === "ctrl" && event.ctrlKey) ||
		(modifier === "meta" && event.metaKey) ||
		(modifier === "shift" && event.shiftKey)
	);
}
