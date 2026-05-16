import { describe, expect, it } from "vitest";
import { COMMENT_CHECKER_WIDGET_KEY, type CommentCheckerUiState, getCommentCheckerWidgetLines } from "../src/ui.ts";

describe("getCommentCheckerWidgetLines", () => {
	it("#given loading state #when formatting widget #then hides setup progress", () => {
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
		expect(lines).toBeUndefined();
	});

	it("#given missing binary state #when formatting widget #then hides install guidance", () => {
		// given
		const state: CommentCheckerUiState = {
			status: "missing",
			checkedFiles: [],
			warnings: [],
		};

		// when
		const lines = getCommentCheckerWidgetLines(state);

		// then
		expect(lines).toBeUndefined();
	});

	it("#given warning state #when formatting widget #then keeps widget hidden", () => {
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
		expect(lines).toBeUndefined();
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

	it("#given checker error state #when formatting widget #then hides error details", () => {
		// given
		const state: CommentCheckerUiState = {
			status: "error",
			checkedFiles: ["src/a.ts"],
			warnings: [],
			errorMessage: "failed",
		};

		// when
		const lines = getCommentCheckerWidgetLines(state);

		// then
		expect(lines).toBeUndefined();
	});
});
