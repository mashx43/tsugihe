import type { JSX } from "solid-js";
import { i18n } from "#imports";
import icon from "~/assets/icon.svg";

export function NotAvailable(): JSX.Element {
	return (
		<div class="flex flex-col items-center p-6">
			<img class="my-4 w-24 min-w-30" src={icon} alt="icon" />
			<p class="text-center">{i18n.t("not_available")}</p>
		</div>
	);
}
