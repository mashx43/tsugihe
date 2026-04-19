import { createResource } from "solid-js";
import {
	formatKey,
	getModifierLabels,
	type ModifierKey,
} from "@/utils/keyboard";
import {
	getModifierKey,
	getNextKey,
	getPrevKey,
	setModifierKey,
	setNextKey,
	setPrevKey,
} from "@/utils/storage";

export function useKeySettings() {
	const [modifierKey, { mutate: mutateModifier }] =
		createResource(getModifierKey);
	const [nextKey, { mutate: mutateNext }] = createResource(getNextKey);
	const [prevKey, { mutate: mutatePrev }] = createResource(getPrevKey);
	const [platformInfo] = createResource(() =>
		browser.runtime.getPlatformInfo(),
	);

	function getModifierLabel(): string {
		const mod = modifierKey();
		if (!mod || mod === "none") return "";

		const labels = getModifierLabels(platformInfo()?.os);
		return labels[mod as keyof typeof labels];
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
