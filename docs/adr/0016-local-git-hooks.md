# 0016 Local Git Hooks

## Status

Accepted

## Context

The project uses no GitHub Actions. Local hooks must catch mistakes before commits and pushes.

## Decision

Use `.githooks/` with `core.hooksPath`. Pre-commit runs lint, format check, build, and gitleaks if installed. Commit-msg validates Conventional Commits. Pre-push runs tests, build, and smoke.

## Consequences

Checks are local and explicit. Contributors install hooks with `make install-hooks`.

## Alternatives Considered

Lefthook was considered but plain hooks keep v1 dependency-free.
