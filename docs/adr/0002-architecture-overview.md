# 0002 Architecture Overview And Module Boundaries

## Status

Accepted

## Context

The experience has separate concerns: permissions, frame buffering, rendering, optional ONNX inference, audio buffering, and UI controls.

## Decision

Keep the frontend feature in `src/features/slowmo/`. `useSlowMotionExperience` coordinates lifecycle state. `FrameBuffer` owns timestamped frame retention. `SlowMotionRenderer` owns WebGPU/Canvas output. `SlowAudioEngine` owns Web Audio graph setup. `RifeClient` and `rifeWorker` isolate ONNX Runtime Web.

## Consequences

The app can test pure logic without camera hardware, and unsupported browser features can fall back in one place.

## Alternatives Considered

A single component was simpler initially but would make camera, audio, rendering, and inference harder to test and maintain.
