# 0013 Testing Strategy

## Status

Accepted

## Context

Camera and microphone permission prompts are hard to exercise reliably in CI-free local hooks. Pure logic and page load behavior still need coverage.

## Decision

Use Vitest for logic tests and Playwright for a static Pages smoke test. `make test` runs unit tests. `make smoke` builds, serves the Pages output, and verifies the workbench loads.

## Consequences

Local checks are fast enough for hooks. Hardware-specific behavior remains manually tested.

## Alternatives Considered

Full mocked-camera e2e was deferred because it would add brittle browser launch flags and fake media assets.
