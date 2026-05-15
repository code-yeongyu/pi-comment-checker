export const COMMENT_CHECKER_WIDGET_KEY = "pi-comment-checker";

export type CommentCheckerUiStatus = "idle" | "loading" | "missing" | "clean" | "warning" | "error";

export type CommentCheckerWarning = {
	filePath: string;
	message: string;
};

export type CommentCheckerUiState = {
	status: CommentCheckerUiStatus;
	checkedFiles: string[];
	warnings: CommentCheckerWarning[];
	errorMessage?: string;
};

export type WidgetSetter = (
	key: string,
	lines: string[] | undefined,
	options?: { placement?: "aboveEditor" | "belowEditor" },
) => void;

export function getCommentCheckerWidgetLines(state: CommentCheckerUiState): string[] | undefined {
	if (state.status !== "warning" || state.warnings.length === 0) return undefined;

	const filePaths = [...new Set(state.warnings.map((warning) => warning.filePath))];
	const lines = ["comment-checker: comment detected", ...filePaths.slice(0, 6)];
	if (filePaths.length > 6) lines.push(`... ${filePaths.length - 6} more`);
	return lines;
}

export function syncCommentCheckerWidget(setWidget: WidgetSetter, state: CommentCheckerUiState): void {
	setWidget(COMMENT_CHECKER_WIDGET_KEY, getCommentCheckerWidgetLines(state), { placement: "aboveEditor" });
}
