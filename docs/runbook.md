# Runbook

Mode A has no server operations.

Local checks:

- `make dev` starts Vite.
- `make build` writes the Pages site to `docs/`.
- `make pages-preview` serves the built Pages output.
- `make smoke` runs the Playwright smoke test.

Common issues:

- Camera and microphone require HTTPS on public Pages or localhost in development.
- WebGPU support depends on browser and device. The app falls back to Canvas rendering.
- RIFE ONNX model input signatures vary. The worker supports common `I0`, `I1`, and timestep-style models, but incompatible models report a visible error.
