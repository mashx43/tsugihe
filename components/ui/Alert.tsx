import { type JSX, Show } from "solid-js";

interface AlertProps {
	message: string | null | undefined;
	type?: "error" | "info" | "success" | "warning";
}

export function Alert(props: AlertProps): JSX.Element {
	return (
		<Show when={props.message}>
			<div class={`alert alert-${props.type ?? "error"} shadow-lg`}>
				<svg
					class="size-4"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 256 256"
				>
					<title>Alert Icon</title>
					<path
						fill="currentColor"
						d="M165.66 101.66L139.31 128l26.35 26.34a8 8 0 0 1-11.32 11.32L128 139.31l-26.34 26.35a8 8 0 0 1-11.32-11.32L116.69 128l-26.35-26.34a8 8 0 0 1 11.32-11.32L128 116.69l26.34-26.35a8 8 0 0 1 11.32 11.32M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88"
					/>
				</svg>
				<span>{props.message}</span>
			</div>
		</Show>
	);
}
