# 0009 Configuration And Secrets Management

## Status

Accepted

## Context

The frontend must not contain secrets. Mode A has no backend secrets.

## Decision

Use no secrets. Commit `.env.example` only for public build settings. Keep `.env*`, keys, and certificates ignored. Use gitleaks in local hooks when installed.

## Consequences

The app can be safely served from public GitHub Pages.

## Alternatives Considered

Runtime API keys and encrypted frontend secrets were rejected.
