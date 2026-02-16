import { createResource } from "solid-js";
import {
	getModifierKey,
	getNextKey,
	getPrevKey,
	type ModifierKey,
	setModifierKey,
	setNextKey,
	setPrevKey,
} from "@/utils/storage";

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

export type ModifierLabel =
	| (typeof MODIFIER_LABELS.mac)[keyof typeof MODIFIER_LABELS.mac]
	| (typeof MODIFIER_LABELS.windows)[keyof typeof MODIFIER_LABELS.windows];

export function formatKey(key: string | undefined): string {
	if (!key) return "";
	if (key === " ") return "Space";
	if (key.length === 1) return key.toUpperCase();
	return key;
}

export function useKeySettings() {
	const [modifierKey, { mutate: mutateModifier }] =
		createResource(getModifierKey);
	const [nextKey, { mutate: mutateNext }] = createResource(getNextKey);
	const [prevKey, { mutate: mutatePrev }] = createResource(getPrevKey);
	const [platformInfo] = createResource(() =>
		browser.runtime.getPlatformInfo(),
	);

	function getModifierLabel(): ModifierLabel | "" {
		const mod = modifierKey();
		if (!mod || mod === "none") return "";

		const os = platformInfo()?.os === "mac" ? "mac" : "windows";
		return MODIFIER_LABELS[os][mod];
	}

	function getHint() {
		const modLabel = getModifierLabel();
		const nextLabel = formatKey(nextKey());
		const prevLabel = formatKey(prevKey());

		const connector = modLabel ? " + " : "";
		const nextPart = `${modLabel}${connector}${nextLabel}`;
		const prevPart = `${modLabel}${connector}${prevLabel}`;

		return { next: nextPart, prev: prevPart };
	}

	async function updateModifierKey(value: ModifierKey) {
		await setModifierKey(value);
		mutateModifier(value);
	}

	async function updateNextKey(key: string) {
		await setNextKey(key);
		mutateNext(key);
	}

	async function updatePrevKey(key: string) {
		await setPrevKey(key);
		mutatePrev(key);
	}

	return {
		modifierKey,
		nextKey,
		prevKey,
		getHint,
		updateModifierKey,
		updateNextKey,
		updatePrevKey,
		platformInfo,
	};
}
