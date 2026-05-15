import { describe, expect, it } from "vitest";
import type { CommentCheckerHookInput, ToolResultLike } from "../src/core.ts";
import { createCommentCheckerToolResultHandler, type ExtensionContextLike } from "../src/index.ts";

function makeContext(): ExtensionContextLike & { widgetCalls: unknown[] } {
	const widgetCalls: unknown[] = [];
	return {
		cwd: "/workspace",
		sessionManager: {
			getSessionId: () => "session-1",
		},
		ui: {
			setWidget: (key, lines, options) => {
				widgetCalls.push([key, lines, options]);
			},
		},
		widgetCalls,
	};
}

describe("createCommentCheckerToolResultHandler", () => {
	it("#given apply_patch metadata warning #when handling tool result #then appends checker warning and updates widget", async () => {
		// given
		const event: ToolResultLike = {
			toolName: "apply_patch",
			input: {},
			details: {
				files: [
					{
						filePath: "src/example.ts",
						before: "const value = 1;\n",
						after: "// explain value\nconst value = 2;\n",
						type: "update",
					},
				],
			},
			content: [{ type: "text", text: "update: src/example.ts" }],
			isError: false,
		};
		const calls: CommentCheckerHookInput[] = [];
		const handler = createCommentCheckerToolResultHandler({
			run: async (input) => {
				calls.push(input);
				return {
					status: "warning",
					message: "COMMENT DETECTED",
					binaryPath: "/bin/comment-checker",
					exitCode: 2,
				};
			},
		});
		const ctx = makeContext();

		// when
		const result = await handler(event, ctx);

		// then
		expect(calls).toEqual([
			{
				session_id: "session-1",
				tool_name: "Edit",
				transcript_path: "",
				cwd: "/workspace",
				hook_event_name: "PostToolUse",
				tool_input: {
					file_path: "src/example.ts",
					old_string: "const value = 1;\n",
					new_string: "// explain value\nconst value = 2;\n",
				},
			},
		]);
		expect(result?.content).toEqual([
			{ type: "text", text: "update: src/example.ts" },
			{ type: "text", text: "\n\nCOMMENT DETECTED" },
		]);
		expect(ctx.widgetCalls.at(-1)).toEqual([
			"pi-comment-checker",
			["Comment checker", "1 warning(s)", "checked: src/example.ts", "warning: src/example.ts"],
			{ placement: "aboveEditor" },
		]);
	});

	it("#given missing binary #when handling write result #then shows setup guidance without changing tool output", async () => {
		// given
		const handler = createCommentCheckerToolResultHandler({
			run: async () => ({
				status: "missing",
				message: "missing",
			}),
		});
		const ctx = makeContext();

		// when
		const result = await handler(
			{
				toolName: "write",
				input: {
					filePath: "src/example.ts",
					content: "const value = 1;\n",
				},
				content: [{ type: "text", text: "wrote src/example.ts" }],
				isError: false,
			},
			ctx,
		);

		// then
		expect(result).toBeUndefined();
		expect(ctx.widgetCalls.at(-1)).toEqual([
			"pi-comment-checker",
			["Comment checker", "binary missing", "install: npm install or senpi package reload"],
			{ placement: "aboveEditor" },
		]);
	});
});
