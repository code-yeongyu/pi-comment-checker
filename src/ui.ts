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
	if (state.status === "idle" || state.status === "clean") return undefined;

	const lines = ["Comment checker"];
	if (state.status === "loading") {
		lines.push("loading binary...");
		return lines;
	}
	if (state.status === "missing") {
		lines.push("binary missing", "install: npm install or senpi package reload");
		return lines;
	}
	if (state.status === "error") {
		lines.push("checker error");
		if (state.errorMessage) lines.push(state.errorMessage);
		return lines;
	}

	lines.push(`${state.warnings.length} warning(s)`);
	if (state.checkedFiles.length > 0) lines.push(`checked: ${state.checkedFiles.join(", ")}`);
	for (const warning of state.warnings.slice(0, 6)) {
		lines.push(`warning: ${warning.filePath}`);
	}
	if (state.warnings.length > 6) lines.push(`... ${state.warnings.length - 6} more`);
	return lines;
}

export function syncCommentCheckerWidget(setWidget: WidgetSetter, state: CommentCheckerUiState): void {
	setWidget(COMMENT_CHECKER_WIDGET_KEY, getCommentCheckerWidgetLines(state), { placement: "aboveEditor" });
}
