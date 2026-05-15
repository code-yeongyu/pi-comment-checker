import { describe, expect, it } from "vitest";
import { COMMENT_CHECKER_WIDGET_KEY, type CommentCheckerUiState, getCommentCheckerWidgetLines } from "../src/ui.ts";

describe("getCommentCheckerWidgetLines", () => {
	it("#given loading state #when formatting widget #then shows setup progress without footer data", () => {
		// given
		const state: CommentCheckerUiState = {
			status: "loading",
			checkedFiles: [],
			warnings: [],
		};

		// when
		const lines = getCommentCheckerWidgetLines(state);

		// then
		expect(COMMENT_CHECKER_WIDGET_KEY).toBe("pi-comment-checker");
		expect(lines).toEqual(["Comment checker", "loading binary..."]);
	});

	it("#given missing binary state #when formatting widget #then shows install guidance", () => {
		// given
		const state: CommentCheckerUiState = {
			status: "missing",
			checkedFiles: [],
			warnings: [],
		};

		// when
		const lines = getCommentCheckerWidgetLines(state);

		// then
		expect(lines).toEqual(["Comment checker", "binary missing", "install: npm install or senpi package reload"]);
	});

	it("#given warning state #when formatting widget #then shows checked files and warning count", () => {
		// given
		const state: CommentCheckerUiState = {
			status: "warning",
			checkedFiles: ["src/a.ts", "src/b.ts"],
			warnings: [
				{ filePath: "src/a.ts", message: "COMMENT DETECTED" },
				{ filePath: "src/b.ts", message: "COMMENT DETECTED" },
			],
		};

		// when
		const lines = getCommentCheckerWidgetLines(state);

		// then
		expect(lines).toEqual([
			"Comment checker",
			"2 warning(s)",
			"checked: src/a.ts, src/b.ts",
			"warning: src/a.ts",
			"warning: src/b.ts",
		]);
	});

	it("#given clean state #when formatting widget #then hides stale widget", () => {
		// given
		const state: CommentCheckerUiState = {
			status: "clean",
			checkedFiles: ["src/a.ts"],
			warnings: [],
		};

		// when
		const lines = getCommentCheckerWidgetLines(state);

		// then
		expect(lines).toBeUndefined();
	});
});
