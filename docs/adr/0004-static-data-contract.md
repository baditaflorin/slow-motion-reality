# 0004 Static Data Contract

## Status

Accepted

## Context

Mode A v1 has no shared data feed. Runtime inputs are live camera/microphone streams and an optional local `.onnx` file selected by the user.

## Decision

No committed static data contract is required. The only stable runtime asset contract is the optional local RIFE ONNX file: the worker attempts common RIFE signatures with two image tensors and an optional timestep tensor.

## Consequences

There is no data freshness surface. Model compatibility errors are surfaced in the UI.

## Alternatives Considered

Bundling a model was rejected because public RIFE ONNX files are large and variant-specific.
