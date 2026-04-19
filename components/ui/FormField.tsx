import type { JSX, ParentProps } from "solid-js";

interface FormFieldProps extends ParentProps {
	label?: string;
	description?: string;
	class?: string;
}

export function FormField(props: FormFieldProps): JSX.Element {
	return (
		<div class={`form-control ${props.class ?? ""}`}>
			{props.label && (
				<div class="label">
					<span class="label-text">{props.label}</span>
				</div>
			)}
			{props.children}
			{props.description && (
				<div class="label">
					<span class="label-text-alt">{props.description}</span>
				</div>
			)}
		</div>
	);
}
