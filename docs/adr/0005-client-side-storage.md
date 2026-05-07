# 0005 Client-side Storage

## Status

Accepted

## Context

The app processes ephemeral camera/audio streams. User settings are small and nonessential.

## Decision

Keep v1 state in memory only. Do not persist camera frames, audio, or loaded ONNX models. Add localStorage later only for harmless preferences if users ask for it.

## Consequences

Refreshing the page clears all media and model state, which is privacy-preserving and simple.

## Alternatives Considered

IndexedDB and OPFS were rejected for v1 because recording or caching media is explicitly not a v1 goal.
