/**
 * Escape function for regular expressions
 */
export function escapeReg(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface Token {
	type: "text" | "number";
	value: string;
	index: number;
}

/**
 * Tokenize URL to extract numeric parts as clickable buttons
 */
export function tokenizeUrl(urlStr: string): Token[] {
	const tokens: Token[] = [];
	const regex = /\d+/g;
	let lastIndex = 0;

	for (const match of urlStr.matchAll(regex)) {
		const { index } = match;
		if (index > lastIndex) {
			tokens.push({
				type: "text",
				value: urlStr.slice(lastIndex, index),
				index: lastIndex,
			});
		}
		tokens.push({
			type: "number",
			value: match[0],
			index: index,
		});
		lastIndex = index + match[0].length;
	}

	if (lastIndex < urlStr.length) {
		tokens.push({
			type: "text",
			value: urlStr.slice(lastIndex),
			index: lastIndex,
		});
	}

	return tokens;
}

/**
 * Generate a URL pattern by replacing a number at a specific index with (\d+)
 */
export function generatePattern(
	urlStr: string,
	num: string,
	index: number,
): string | null {
	if (!urlStr || !num) return null;

	const before = urlStr.slice(0, index);
	const after = urlStr.slice(index + num.length);
	const escapedBefore = escapeReg(before);
	const escapedAfter = escapeReg(after);
	return `${escapedBefore}(\\d+)${escapedAfter}`;
}

/**
 * Match a URL against a pattern and return the target URL for the next/prev direction
 */
export function getTargetUrlByPattern(
	currentUrl: string,
	pattern: string,
	direction: "next" | "prev",
): string | null {
	try {
		// Use 'd' flag to get indices of capture groups for precise replacement
		const regex = new RegExp(pattern, "d");
		const match = regex.exec(currentUrl);

		if (match && match.length > 1 && match.indices) {
			const numStr = match[1];
			const num = parseInt(numStr, 10);
			if (!Number.isNaN(num)) {
				const targetNum = direction === "next" ? num + 1 : num - 1;
				if (targetNum >= 0) {
					const targetNumStr = targetNum
						.toString()
						.padStart(numStr.length, "0");

					// match.indices[1] contains the start and end index of the first capture group
					const [start, end] = match.indices[1];

					return (
						currentUrl.substring(0, start) +
						targetNumStr +
						currentUrl.substring(end)
					);
				}
			}
		}
	} catch (e) {
		console.error("[tsugihe] Invalid URL pattern:", pattern, e);
	}
	return null;
}

/**
 * Check if two URLs are substantially the same, ignoring hashes and trailing slashes.
 */
export function isSameUrl(url1: string, url2: string): boolean {
	try {
		const u1 = new URL(url1);
		const u2 = new URL(url2);
		return (
			u1.origin === u2.origin &&
			u1.pathname.replace(/\/$/, "") === u2.pathname.replace(/\/$/, "") &&
			u1.search === u2.search
		);
	} catch {
		return url1 === url2;
	}
}
