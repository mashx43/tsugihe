const INTERACTIVE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const INTERACTIVE_ROLES = new Set([
	"textbox",
	"searchbox",
	"combobox",
	"slider",
	"rating",
	"spinbutton",
	"switch",
	"radio",
]);

/**
 * Determines whether the element is an interactive input element.
 */
export function isInteractiveElement(el: HTMLElement): boolean {
	return (
		INTERACTIVE_TAGS.has(el.tagName) ||
		el.isContentEditable ||
		INTERACTIVE_ROLES.has(el.getAttribute("role") ?? "")
	);
}

/**
 * Clicks the link with the specified URL if it exists in the document.
 */
export function clickLinkByUrl(url: string): boolean {
	const links = Array.from(
		document.querySelectorAll<HTMLAnchorElement>("a[href]"),
	);
	const targetLink = links.find((a) => {
		try {
			return new URL(a.href).href === new URL(url).href;
		} catch {
			return a.href === url;
		}
	});

	if (targetLink) {
		targetLink.click();
		return true;
	}
	return false;
}
