# 0015 Deployment Topology

## Status

Accepted

## Context

Mode A deploys only static files.

## Decision

Use GitHub Pages only. No `deploy/` directory, Docker Compose, nginx, Prometheus, or runtime server is included.

## Consequences

Operations are limited to building and pushing `docs/`.

## Alternatives Considered

Docker backend deployment was rejected as unnecessary for v1.
