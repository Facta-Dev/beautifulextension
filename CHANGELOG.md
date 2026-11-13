# Changelog

All notable changes to this project are listed here. Versions follow
[Semantic Versioning](https://semver.org/), and the version lives in
`.claude-plugin/plugin.json`.

## [Unreleased]

### Added

- **Three skills for Manifest V3 + TypeScript.** `extension-best-practices`
  steers new code toward the event-driven worker, top-level listener
  registration, sender-validated messaging, typed storage with migrations,
  least-privilege permissions, a strict CSP and the unbreakable layer
  contract. `extension-review` reviews a worker, content script, popup,
  manifest, message contract, or diff, and ranks architecture and sender
  validation first. `extension-port` ports MV2 background pages, other
  browsers, or a web app to MV3 with the same behavior.
- **A drop-in ESLint config.** `lints/eslint.config.mjs` (ESLint 9 flat
  config + typescript-eslint 8, strictTypeChecked) turns the layer contract
  into red-on-save output: `no-restricted-imports` keeps the UI off the SDK
  and content scripts off the session; `no-restricted-globals` keeps
  `chrome` out of domain/application; `no-eval`/`no-new-func` enforce the
  no-remote-code rule.
- **Proof that every rule fires.** `lints/check/` holds one deliberate
  violation per rule plus a clean file, and `scripts/check-lints.sh` runs
  eslint and tsc over both, bounded and with stderr surfaced.
- **A skill validator, an example compiler, and a test suite.**
  `scripts/check-skill.py` checks frontmatter, links, eval cases and the
  plugin manifests; `scripts/check-examples.py` compiles every `ts` block;
  `tests/` covers the unit, contract, integration and CI-gate layers.
- **A worked review.** `examples/review-extension.md` shows the report shape
  and the architecture-first ranking on a small MV3 extension.

[Unreleased]: https://github.com/Facta-Dev/beautifulextension/compare/v0.1.0...HEAD
