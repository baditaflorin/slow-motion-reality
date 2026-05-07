# 0012 Metrics And Observability

## Status

Accepted

## Context

Mode A has no server metrics. Analytics are not required to prove v1.

## Decision

Use no analytics. Surface local runtime indicators only: renderer mode, buffer depth, FPS, support checks, and RIFE status.

## Consequences

The app has a privacy-preserving default and no third-party tracking.

## Alternatives Considered

Plausible or beacon analytics were rejected for v1 because product telemetry is not necessary.
