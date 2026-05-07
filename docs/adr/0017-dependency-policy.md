# 0017 Dependency Policy

## Status

Accepted

## Context

The app touches camera, audio, GPU, workers, and ONNX inference. Custom implementations should stay limited to app-specific glue.

## Decision

Use production-ready libraries for framework, build, PWA, tests, icons, schema validation, and ONNX Runtime Web. Avoid bespoke inference runtimes or custom media permission wrappers.

## Consequences

The app remains maintainable while preserving a small dependency set.

## Alternatives Considered

Hand-rolled UI and ONNX/WASM handling were rejected because mature libraries exist.
