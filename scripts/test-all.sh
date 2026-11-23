#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node --test tests/*.test.js
python3 -B tests/database_test.py
node scripts/browser-test.js
node scripts/tooling-report.js
printf '\nPASS: synthetic package tests only (NOT private app acceptance)\n'
