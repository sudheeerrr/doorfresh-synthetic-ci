# Independent synthetic public CI

This repository package is self-contained, original synthetic test code. It does **not** contain private application source, a checkout of the private repository, customer records, cloud IDs, credentials, signing keys, or production configuration.

## What it verifies

- A deliberately minimal Node HTTP fixture, response codes, and security headers.
- Synthetic PWA manifest and service-worker structure (not installability certification).
- SQLite **in-memory** relational constraints and simple commerce arithmetic. **Not MariaDB acceptance.**
- Chromium/Chrome rendering an isolated localhost synthetic HTML fixture. **Not private storefront browser acceptance.**
- Tooling availability for Node, Python, Flutter, Android SDK and Xcode, marked unavailable when not installed. **Not mobile build acceptance.**

## Run locally

Requirements: Node >=20, Python 3, Chrome/Chromium available in PATH, Bash. No external npm packages, database credentials, secrets, Docker or network service are needed for local execution.

```bash
python3 -B scripts/allowlist.py
python3 -B scripts/security-scan.py
bash scripts/test-all.sh
```

## GitHub Actions

Manually trigger `Public-safe synthetic CI - no deployment`. Workflow has only `workflow_dispatch`, `contents: read`, short time limit, a fixed checkout commit SHA, no third-party runtime dependencies, no secrets, no private repositories, no reusable workflows, and no deployment. The workflow fails if the sandboxed browser cannot start, or if a required test prerequisite is missing. Never disable Chromium sandboxing to force a pass. The Linux runner merely reports Android/iOS tooling availability; Android/iOS releases must be tested in separate authorized environments. Ubuntu runner image is specified as `ubuntu-24.04`; for fully reproducible OS-level tests, pin and verify a container image digest in a future authorized enhancement.

**Publishing is not authorized by preparation.** Before publication, independently review every file, confirm account restrictions, then create a new public repo with no history imported from any private repo. Public CI does not prove the private application's security, functionality, release readiness, database, real payments, or native app behavior.
