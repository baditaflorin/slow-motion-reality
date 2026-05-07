# 0014 Error Handling Conventions

## Status

Accepted

## Context

Browser APIs fail for normal reasons: permission denial, unsupported WebGPU, incompatible ONNX models, or unavailable audio contexts.

## Decision

Catch async lifecycle errors, surface readable messages in the UI, and keep fallbacks available. Do not throw from UI event handlers without catching.

## Consequences

Users get actionable state instead of a blank screen.

## Alternatives Considered

Global-only error boundaries were rejected because most failures happen inside explicit permission and worker flows.
