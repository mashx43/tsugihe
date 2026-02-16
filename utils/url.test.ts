import { describe, expect, test } from "bun:test";
import { generatePattern, getTargetUrlByPattern, tokenizeUrl } from "./url";

describe("utils/url", () => {
	describe("tokenizeUrl", () => {
		test("should tokenize URL with numbers correctly", () => {
			const url = "https://example.com/page/1";
			const tokens = tokenizeUrl(url);
			expect(tokens).toEqual([
				{ type: "text", value: "https://example.com/page/", index: 0 },
				{ type: "number", value: "1", index: 25 },
			]);
		});

		test("should handle URL with multiple numbers", () => {
			const url = "https://example.com/2023/05/page/1";
			const tokens = tokenizeUrl(url);
			expect(tokens).toEqual([
				{ type: "text", value: "https://example.com/", index: 0 },
				{ type: "number", value: "2023", index: 20 },
				{ type: "text", value: "/", index: 24 },
				{ type: "number", value: "05", index: 25 },
				{ type: "text", value: "/page/", index: 27 },
				{ type: "number", value: "1", index: 33 },
			]);
		});

		test("should handle URL without numbers", () => {
			const url = "https://example.com/about";
			const tokens = tokenizeUrl(url);
			expect(tokens).toEqual([
				{ type: "text", value: "https://example.com/about", index: 0 },
			]);
		});
	});

	describe("generatePattern", () => {
		test("should generate regex pattern replacing number at index", () => {
			const url = "https://example.com/page/123";
			const num = "123";
			const index = 25;
			const pattern = generatePattern(url, num, index);
			// The expected pattern escapes special chars and replaces the number with (\d+)
			// https://example.com/page/ -> https://example\.com/page/
			expect(pattern).toBe("https://example\\.com/page/(\\d+)");
		});

		test("should return null for invalid inputs", () => {
			expect(generatePattern("", "1", 0)).toBeNull();
			expect(generatePattern("url", "", 0)).toBeNull();
		});
	});

	describe("getTargetUrlByPattern", () => {
		test("should return next URL for basic increment", () => {
			const currentUrl = "https://example.com/page/1";
			const pattern = "https:\\/\\/example\\.com\\/page\\/(\\d+)";
			const target = getTargetUrlByPattern(currentUrl, pattern, "next");
			expect(target).toBe("https://example.com/page/2");
		});

		test("should return prev URL for decrement", () => {
			const currentUrl = "https://example.com/page/2";
			const pattern = "https:\\/\\/example\\.com\\/page\\/(\\d+)";
			const target = getTargetUrlByPattern(currentUrl, pattern, "prev");
			expect(target).toBe("https://example.com/page/1");
		});

		test("should handle zero padding correctly", () => {
			const currentUrl = "https://example.com/issue/001";
			// pattern matches "001" as (\d+)
			const pattern = "https:\\/\\/example\\.com\\/issue\\/(\\d+)";

			const nextTarget = getTargetUrlByPattern(currentUrl, pattern, "next");
			expect(nextTarget).toBe("https://example.com/issue/002");

			const prevTarget = getTargetUrlByPattern(currentUrl, pattern, "prev");
			// 001 - 1 = 0.
			expect(prevTarget).toBe("https://example.com/issue/000");
		});

		test("should return null if pattern does not match", () => {
			const currentUrl = "https://example.com/page/abc";
			const pattern = "https:\\/\\/example\\.com\\/page\\/(\\d+)";
			const target = getTargetUrlByPattern(currentUrl, pattern, "next");
			expect(target).toBeNull();
		});

		test("should return target URL if target number is zero", () => {
			const currentUrl = "https://example.com/page/1";
			const pattern = "https:\\/\\/example\\.com\\/page\\/(\\d+)";
			const target = getTargetUrlByPattern(currentUrl, pattern, "prev");
			// 1 - 1 = 0
			expect(target).toBe("https://example.com/page/0");
		});

		test("should return null if target number is negative", () => {
			const currentUrl = "https://example.com/page/0";
			const pattern = "https:\\/\\/example\\.com\\/page\\/(\\d+)";
			const target = getTargetUrlByPattern(currentUrl, pattern, "prev");
			// 0 - 1 = -1, which is < 0
			expect(target).toBeNull();
		});

		test("should handle duplicate numbers in URL correctly", () => {
			const currentUrl = "https://example.com/2023/page/2023";
			// The pattern targets the second occurrence of "2023"
			const pattern = "https:\\/\\/example\\.com\\/2023\\/page\\/(\\d+)";

			const target = getTargetUrlByPattern(currentUrl, pattern, "next");
			// Expected: https://example.com/2023/page/2024
			expect(target).toBe("https://example.com/2023/page/2024");
		});
	});
});
