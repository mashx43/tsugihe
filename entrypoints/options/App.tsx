import { Alert } from "@/components/ui/Alert";
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
				<Alert message={error()} />

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
