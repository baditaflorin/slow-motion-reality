# 0011 Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Production browser console output should be minimal.

## Decision

Show user-relevant lifecycle events in the in-app event log. Avoid routine production `console.log` calls.

## Consequences

Users can see state changes without exposing noisy logs.

## Alternatives Considered

Remote logging was rejected because it would introduce a backend or third-party collector.
