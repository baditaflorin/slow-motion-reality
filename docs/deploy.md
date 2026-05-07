# Deploy

Slow-motion Reality deploys as Mode A: Pure GitHub Pages.

Live URL: https://baditaflorin.github.io/slow-motion-reality/

Publishing source: `main` branch, `/docs` folder.

To publish manually:

1. Run `make build`.
2. Commit the changed `docs/` output.
3. Push `main`.

To roll back, revert the publishing commit and push `main`.

GitHub Pages does not support custom response headers, so COOP/COEP isolation is not assumed. ONNX Runtime Web is loaded lazily, and the app falls back to WebAssembly/Canvas paths when WebGPU or isolation is unavailable.
