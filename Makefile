.PHONY: help install-hooks dev build test test-integration smoke lint fmt pages-preview clean hooks-pre-commit hooks-commit-msg hooks-pre-push

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "%-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## wire local git hooks
	git config core.hooksPath .githooks

dev: ## run frontend dev server
	npm run dev

build: ## build GitHub Pages site into docs/
	rm -rf docs/assets docs/sw.js docs/workbox-*.js docs/registerSW.js docs/manifest.webmanifest docs/index.html docs/404.html
	npm run build
	cp docs/index.html docs/404.html
	test -f docs/index.html

test: ## run unit tests
	npm run test

test-integration: ## no separate integration suite for Mode A v1
	@echo "No integration tests for Mode A v1."

smoke: build ## serve docs and run Playwright smoke tests
	npm run smoke

lint: ## run linters and type checks
	npm run lint
	npm run format:check
	npm run build

fmt: ## autoformat source
	npm run format

pages-preview: build ## serve built Pages output locally
	npm run pages-preview

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	.githooks/commit-msg .git/COMMIT_EDITMSG

hooks-pre-push:
	.githooks/pre-push

clean: ## remove generated caches
	rm -rf docs/assets docs/workbox-* docs/sw.js docs/manifest.webmanifest docs/404.html node_modules/.vite coverage playwright-report test-results
