# pi-comment-checker

[![ci](https://github.com/code-yeongyu/pi-comment-checker/actions/workflows/ci.yml/badge.svg)](https://github.com/code-yeongyu/pi-comment-checker/actions/workflows/ci.yml) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Comment checker hook for the [pi coding agent](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) and `senpi`. It runs [`@code-yeongyu/comment-checker`](https://github.com/code-yeongyu/go-claude-code-comment-checker) after mutation tools and appends the checker warning back into the tool result so the agent must react.

This package is the standalone pi extension version of the `oh-my-openagent` / `../omo` comment-checker hook.

## Behavior

| Case | Result |
|------|--------|
| `write` succeeds | checks the written `content` |
| `edit` succeeds | checks `old_string` / `new_string` |
| `multiedit` succeeds | checks the complete `edits` payload |
| `apply_patch` succeeds with OMO metadata | checks each metadata file using `before` / `after`, skips deletes |
| `apply_patch` succeeds without metadata | falls back to raw Codex patch parsing |
| checker exits `2` | appends the warning message to the tool result and shows a minimal detected-comment TUI widget |
| checker binary missing | leaves the TUI hidden and leaves tool output unchanged |
| checker exits unexpectedly | leaves the TUI hidden and leaves tool output unchanged |

## apply_patch support

`apply_patch` is handled in two layers:

1. OMO-compatible metadata/details:

```json
{
  "files": [
    {
      "filePath": "src/old.ts",
      "movePath": "src/new.ts",
      "before": "const before = 1;\n",
      "after": "// explain next value\nconst after = 2;\n",
      "type": "update"
    }
  ]
}
```

2. Raw Codex patch fallback:

```text
*** Begin Patch
*** Update File: src/example.ts
@@
-const before = 1;
+// explain value
+const after = 2;
*** End Patch
```

Deletes are ignored because they cannot introduce new comments.

## TUI

The extension uses an above-editor widget with key `pi-comment-checker`.

| State | Widget |
|---|---|
| Loading | hidden |
| Missing binary | hidden |
| Warning | `comment-checker: comment detected` plus warning file paths |
| Clean | widget hidden |

It does not set or modify the footer.

## Installation

The package targets the `pi` / `senpi` extension package system.

```bash
# 1. From npm (once published)
pi install npm:pi-comment-checker

# 2. From git
pi install git:github.com/code-yeongyu/pi-comment-checker

# 3. senpi settings.json
{
  "packages": [
    "git:github.com/code-yeongyu/pi-comment-checker"
  ]
}

# 4. Dev / one-shot test
pi -e /path/to/pi-comment-checker/src/index.ts
senpi -e /path/to/pi-comment-checker/src/index.ts
```

After installation, restart pi/senpi or run `/reload` inside an interactive session.

## Command

### `/comment-checker`

Shows binary availability and setup guidance.

## Development

```bash
npm install
npm test
npm run typecheck
npm run check
npm pack --dry-run
pi -e ./src/index.ts
```

## Branch rules and releases

- `main` is protected by `.github/branch-ruleset.json`.
- CI runs Node 20 and 22 on Ubuntu and macOS.
- Releases are GitHub Releases tagged as `v<semver>`.
- Publishing runs from the `publish` workflow after a GitHub Release is published.

## Origin

Ported from `../omo/src/hooks/comment-checker` and adapted to the public pi-coding-agent extension API.

## License

[MIT](LICENSE).

## Related

- [senpi](https://github.com/code-yeongyu/senpi) — the fork/runtime these extensions are extracted for.
- [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) — original OpenCode plugin hook source.
- [comment-checker](https://github.com/code-yeongyu/go-claude-code-comment-checker) — native checker binary.

## Acknowledgements

- **Mario Zechner** ([@badlogic](https://github.com/badlogic)) — author of [pi-mono](https://github.com/badlogic/pi-mono) and the pi-coding-agent extension API this package targets.
- **Yeongyu Kim** ([@code-yeongyu](https://github.com/code-yeongyu)) — maintainer of senpi, oh-my-openagent, and comment-checker.
