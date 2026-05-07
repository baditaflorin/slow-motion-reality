# 0003 Frontend Framework And Build Tooling

## Status

Accepted

## Context

The UI needs typed state, fast iteration, a static build, and reliable GitHub Pages base-path handling.

## Decision

Use React, TypeScript strict mode, and Vite. Use `vite-plugin-pwa` for the manifest and service worker, Vitest for unit tests, Playwright for smoke tests, and Prettier/ESLint for local checks.

## Consequences

The stack is familiar, production-ready, and works cleanly with Pages. The initial JS is split so ONNX code is isolated in a separate chunk.

## Alternatives Considered

Vanilla TypeScript was possible, but React gives better state composition for the control-heavy UI. Next.js was rejected because a static Vite app is smaller and simpler here.
