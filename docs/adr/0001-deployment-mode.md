# 0001 Deployment Mode

## Status

Accepted

## Context

The project needs camera input, microphone input, GPU rendering, optional ONNX frame interpolation, local controls, and local buffering. It does not need accounts, shared state, secrets, server-side processing, or writes.

## Decision

Use Mode A: Pure GitHub Pages. The app is a static Vite build committed to `docs/` and served by GitHub Pages. Browser APIs handle camera, microphone, WebGPU, Web Audio, workers, and local files.

## Consequences

The public runtime has no backend to operate and no server secrets to protect. WebGPU and ONNX acceleration depend on each browser. GitHub Pages cannot provide custom COOP/COEP headers, so the app must degrade gracefully without assuming cross-origin isolation.

## Alternatives Considered

Mode B was unnecessary because v1 has no generated data. Mode C was rejected because server-side GPU inference would add operational risk, cost, and privacy concerns without being required for v1.
