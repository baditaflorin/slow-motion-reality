# 0006 WASM Modules

## Status

Accepted

## Context

ONNX Runtime Web may use WASM and WebGPU execution providers. GitHub Pages does not allow custom COOP/COEP headers.

## Decision

Use `onnxruntime-web` lazily in a Web Worker when the user provides a model. Prefer the WebGPU execution provider and fall back to WASM where supported. The core app works without ONNX by blending adjacent buffered frames in the renderer.

## Consequences

The first load stays smaller, and unsupported ONNX configurations do not break the core experience.

## Alternatives Considered

Shipping a service-worker isolation shim was rejected for v1 because it is brittle on Pages and unnecessary for the fallback renderer.
