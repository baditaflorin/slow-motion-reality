# 0010 GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The Pages URL must work from day one and Vite assets need the repository base path.

## Decision

Publish from the `main` branch `/docs` folder. Configure Vite with `base: "/slow-motion-reality/"` and `outDir: "docs"`. Keep `emptyOutDir: false` so ADRs and documentation remain in `docs/`. Copy `docs/index.html` to `docs/404.html` after build for SPA fallback.

## Consequences

The built frontend and documentation coexist in `docs/`. The `docs/` directory is intentionally tracked and not gitignored.

## Alternatives Considered

A `gh-pages` branch was rejected because the prompt requires frequent committed build output and day-one visibility. Publishing from root was rejected because build artifacts would clutter the repository root.
