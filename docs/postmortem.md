# Postmortem

## What Was Built

Slow-motion Reality v0.1.0 is a static browser app that captures camera and microphone input, buffers frames, plays the visual stream at one-quarter perceived time, renders through WebGPU with a Canvas fallback, and exposes a lazy RIFE ONNX worker path for compatible user-supplied models.

## Deployment Mode In Hindsight

Mode A was the correct choice. The project needs no auth, writes, server secrets, or runtime database. The main limitations are browser GPU capability and GitHub Pages header control, not backend absence.

## What Worked

- GitHub Pages is enough for the runtime surface.
- WebGPU and Canvas can share the same buffered playback model.
- Web Audio can provide local delayed monitoring without a server.

## What Did Not

- Shipping a bundled RIFE model would be too large for a clean v1 repository.
- Browser isolation headers cannot be configured on GitHub Pages, so some ONNX acceleration paths are browser-dependent.

## Surprises

The practical v1 is less about perfect optical-flow interpolation and more about stable buffering, graceful fallback, and a tactile rendering surface.

## Accepted Tech Debt

- The ONNX worker supports common RIFE signatures but does not normalize every public model variant.
- Audio is delayed and filtered rather than full pitch-preserving time-stretch synthesis.
- There is no visual regression test because camera permissions are intentionally not mocked in the smoke test.

## Next Improvements

1. Add a documented compatible RIFE model recipe and checksum.
2. Add an AudioWorklet phase-vocoder for stronger 4x time-stretched audio.
3. Add WebCodecs capture for lower-overhead frame buffering.

## Time

Estimated: one implementation session for v0.1.0. Actual: one implementation session.
