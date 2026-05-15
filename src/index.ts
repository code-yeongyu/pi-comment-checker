import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { type CommentCheckerRunResult, resolveCommentCheckerBinary, runCommentChecker } from "./cli.js";
import {
	type CommentCheckerHookInput,
	extractCommentCheckRequests,
	type ToolResultContent,
	type ToolResultLike,
	toHookInput,
} from "./core.js";
import { type CommentCheckerUiState, syncCommentCheckerWidget, type WidgetSetter } from "./ui.js";

export type ExtensionContextLike = {
	cwd: string;
	sessionManager?: {
		getSessionId?: () => string;
		getHeader?: () => { id?: string } | null;
	};
	ui: {
		setWidget: WidgetSetter;
		notify?: (message: string, level?: "info" | "warning" | "error") => void;
	};
};

export type ToolResultHandlerResult = {
	content?: ToolResultContent[];
};

export type CommentCheckerHandlerDeps = {
	run?: (input: CommentCheckerHookInput) => Promise<CommentCheckerRunResult>;
};

export default function commentCheckerExtension(pi: ExtensionAPI): void {
	let state: CommentCheckerUiState = { status: "idle", checkedFiles: [], warnings: [] };

	const setState = (ctx: ExtensionContextLike, nextState: CommentCheckerUiState): void => {
		state = nextState;
		syncCommentCheckerWidget(ctx.ui.setWidget, state);
	};

	pi.on("session_start", async (_event, ctx) => {
		if (!resolveCommentCheckerBinary()) {
			setState(ctx, { status: "missing", checkedFiles: [], warnings: [] });
			return;
		}
		setState(ctx, { status: "idle", checkedFiles: [], warnings: [] });
	});

	pi.on("tool_result", createCommentCheckerToolResultHandler({}));

	pi.registerCommand("comment-checker", {
		description: "Show comment-checker extension status and setup guidance.",
		handler: async (_args, ctx) => {
			if (!resolveCommentCheckerBinary()) {
				setState(ctx, { status: "missing", checkedFiles: [], warnings: [] });
				ctx.ui.notify?.("comment-checker binary missing; reinstall/reload the extension package.", "warning");
				return;
			}
			syncCommentCheckerWidget(ctx.ui.setWidget, state);
			ctx.ui.notify?.("comment-checker binary is available.", "info");
		},
	});
}

export function createCommentCheckerToolResultHandler(deps: CommentCheckerHandlerDeps) {
	return async (event: ToolResultLike, ctx: ExtensionContextLike): Promise<ToolResultHandlerResult | undefined> => {
		const requests = extractCommentCheckRequests(event);
		if (requests.length === 0) return undefined;

		syncCommentCheckerWidget(ctx.ui.setWidget, {
			status: "loading",
			checkedFiles: requests.map((request) => request.filePath),
			warnings: [],
		});

		const checkedFiles: string[] = [];
		const warnings: Array<{ filePath: string; message: string }> = [];
		const runner = deps.run ?? ((input: CommentCheckerHookInput) => runCommentChecker(input));

		for (const request of requests) {
			const input = toHookInput(request, { sessionId: getSessionId(ctx), cwd: ctx.cwd });
			const result = await runner(input);
			if (result.status === "missing") {
				syncCommentCheckerWidget(ctx.ui.setWidget, {
					status: "missing",
					checkedFiles,
					warnings,
				});
				return undefined;
			}
			if (result.status === "error") {
				syncCommentCheckerWidget(ctx.ui.setWidget, {
					status: "error",
					checkedFiles,
					warnings,
					errorMessage: result.message,
				});
				return undefined;
			}
			checkedFiles.push(request.filePath);
			if (result.status === "warning" && result.message.trim().length > 0) {
				warnings.push({ filePath: request.filePath, message: result.message.trim() });
			}
		}

		if (warnings.length === 0) {
			syncCommentCheckerWidget(ctx.ui.setWidget, { status: "clean", checkedFiles, warnings });
			return undefined;
		}

		syncCommentCheckerWidget(ctx.ui.setWidget, { status: "warning", checkedFiles, warnings });
		return {
			content: [
				...(event.content ?? []),
				...warnings.map((warning) => ({
					type: "text" as const,
					text: `\n\n${warning.message}`,
				})),
			],
		};
	};
}

function getSessionId(ctx: ExtensionContextLike): string {
	return ctx.sessionManager?.getSessionId?.() ?? ctx.sessionManager?.getHeader?.()?.id ?? "unknown";
}
