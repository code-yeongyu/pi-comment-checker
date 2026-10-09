# Changelog

## [Unreleased]

### Changed

- Peer dependencies on `@earendil-works/pi-*` are `>=0.87.1` instead of `*`. 0.87.1 is the oldest pi the extension is verified against: typecheck and the full test suite pass with every `@earendil-works` package at 0.87.1.
- CI: the Dependabot `bun.lock` refresh approves the CI run its own push starts, so the required checks attach to the pull request, and falls back to dispatching `ci.yml` if that run cannot be approved.
- Docs: install from GitHub instead of npm.

## [0.1.1] - 2026-09-24

### Changed

- Migrated peer dependencies and imports from `@mariozechner/pi-*` to `@earendil-works/pi-*` (`pi-ai`, `pi-coding-agent`, `pi-tui`).
- Pinned development toolchain: Biome `2.5.14`, Vitest `5.0.1`, TypeScript `7.0.2`, `@types/node` `26.6.2`, `@typescript/native-preview` `7.0.0-dev.20260707.2`.
- Added exact `@earendil-works/pi-ai` and `@earendil-works/pi-coding-agent` `0.87.1` development dependencies so tests typecheck against the current upstream runtime.
- CI uses Bun `1.4.2` with Node `22`/`24` on Ubuntu and macOS, plus an `npm-consumer` smoke job (`npm ci` + `npm test`).
- Publish workflow verifies with Bun and still publishes with `npm publish --access public --provenance`.
- Raised `engines.node` to `>=22.19.0`.

### Fixed

- Dependency and CI refresh tracked in #14.

## [0.1.0] - 2026-05-15

### Added

- Initial standalone `pi-comment-checker` extension.
- Post-mutation checks for `write`, `edit`, `multiedit`, and `apply_patch`.
- OMO-compatible `apply_patch` metadata support using `before` / `after` file content.
- Raw Codex patch fallback parsing for `apply_patch`.
- Above-editor TUI widget for loading, missing-binary, warning, and error states.
- `/comment-checker` status command.
