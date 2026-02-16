import { Show } from "solid-js";
import { useKeySettings } from "@/hooks/useKeySettings";
import { DisabledSitesEditor } from "./components/DisabledSitesEditor";
import { KeyRecordingButton } from "./components/KeyRecordingButton";
import { ModifierSelect } from "./components/ModifierSelect";
import { useKeyRecorder } from "./hooks/useKeyRecorder";
import "../popup/App.css";

export default function App() {
	const {
		modifierKey,
		nextKey,
		prevKey,
		updateModifierKey,
		updateNextKey,
		updatePrevKey,
		platformInfo,
	} = useKeySettings();

	const { isRecording, setIsRecording, error, handleKeyDown } = useKeyRecorder({
		updateNextKey,
		updatePrevKey,
	});

	return (
		<div
			role="application"
			class="mx-auto max-w-md p-8"
			onKeyDown={handleKeyDown}
			tabIndex={-1}
		>
			<header class="mb-8">
				<h1 class="font-bold text-3xl">{i18n.t("options_title")}</h1>
			</header>

			<main class="space-y-6">
				<Show when={error()}>
					<div class="alert alert-error shadow-lg">
						<svg
							class="size-4"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 256 256"
						>
							<title>Error Icon</title>
							<path
								fill="currentColor"
								d="M165.66 101.66L139.31 128l26.35 26.34a8 8 0 0 1-11.32 11.32L128 139.31l-26.34 26.35a8 8 0 0 1-11.32-11.32L116.69 128l-26.35-26.34a8 8 0 0 1 11.32-11.32L128 116.69l26.34-26.35a8 8 0 0 1 11.32 11.32M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88"
							/>
						</svg>
						<span>{error()}</span>
					</div>
				</Show>

				<section class="card bg-base-200 shadow-xl">
					<div class="card-body space-y-4">
						<h2 class="card-title mb-2">{i18n.t("key_settings_title")}</h2>

						<ModifierSelect
							value={modifierKey()}
							onChange={updateModifierKey}
							isMac={platformInfo()?.os === "mac"}
						/>

						<KeyRecordingButton
							label={i18n.t("next_key_label")}
							isRecording={isRecording() === "next"}
							value={nextKey()}
							onRecordStart={() => setIsRecording("next")}
						/>

						<KeyRecordingButton
							label={i18n.t("prev_key_label")}
							isRecording={isRecording() === "prev"}
							value={prevKey()}
							onRecordStart={() => setIsRecording("prev")}
						/>
					</div>
				</section>
				<section class="card bg-base-200 shadow-xl">
					<div class="card-body">
						<h2 class="card-title mb-2">{i18n.t("disabled_sites_title")}</h2>
						<DisabledSitesEditor />
					</div>
				</section>
			</main>
		</div>
	);
}
