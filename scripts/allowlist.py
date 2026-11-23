"""Allowlist for publication. Run locally before approval and in CI."""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
ALLOWED = {
    '.github/workflows/synthetic-ci.yml',
    '.gitignore', 'README.md', 'package.json',
    'public/index.html', 'public/manifest.webmanifest', 'public/service-worker.js',
    'scripts/allowlist.py', 'scripts/browser-test.js', 'scripts/server.js',
    'scripts/test-all.sh', 'scripts/tooling-report.js', 'scripts/security-scan.py',
    'tests/node.test.js', 'tests/pwa.test.js', 'tests/database_test.py'
}
actual = {str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.relative_to(ROOT).parts}
extra, missing = sorted(actual - ALLOWED), sorted(ALLOWED - actual)
if extra or missing:
    print(f'FAIL: unexpected files={extra}; missing files={missing}', file=sys.stderr)
    sys.exit(1)
# Public-safe source is intentionally original, with no private git history.
result = subprocess.run(['git', 'ls-files'], cwd=ROOT, text=True, capture_output=True)
if result.returncode == 0:
    tracked = set(result.stdout.splitlines())
    if tracked != ALLOWED:
        print(f'FAIL: tracked paths mismatch: missing={sorted(ALLOWED - tracked)}, extra={sorted(tracked - ALLOWED)}', file=sys.stderr)
        sys.exit(1)
print(f'PASS: {len(actual)} expected public-safe files, no unexpected files')
