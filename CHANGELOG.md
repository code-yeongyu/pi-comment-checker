# Changelog

## [0.1.0] - 2026-05-15

### Added

- Initial standalone `pi-comment-checker` extension.
- Post-mutation checks for `write`, `edit`, `multiedit`, and `apply_patch`.
- OMO-compatible `apply_patch` metadata support using `before` / `after` file content.
- Raw Codex patch fallback parsing for `apply_patch`.
- Above-editor TUI widget for loading, missing-binary, warning, and error states.
- `/comment-checker` status command.
