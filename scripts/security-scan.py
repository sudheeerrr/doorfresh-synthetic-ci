"""Conservative publication blocker for synthetic public CI content.

This scan catches common accidental secrets and private-service references;
manual human review remains mandatory before any publication.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
# Limit matching of rule descriptions within this scanner by excluding this file.
SKIP = {Path('scripts/security-scan.py')}
RULES = {
    'private key material': re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'),
    'GitHub credential': re.compile(r'gh[pousr]_[A-Za-z0-9_]{20,}'),
    'GitHub fine-grained credential': re.compile(r'github_pat_[A-Za-z0-9_]{20,}'),
    'Google API credential': re.compile(r'AIza[0-9A-Za-z_-]{35}'),
    'AWS access key': re.compile(r'\b(?:AKIA|ASIA)[0-9A-Z]{16}\b'),
    'hardcoded secret assignment': re.compile(r'(?im)^\s*(?:password|api_key|secret_key|private_key|access_token)\s*[:=]\s*[\'\"]?[^\s\'\"]{10,}'),
    'private application repository': re.compile(r'(?i)(?:github\.com/|git@github\.com:)[^\s/]+/(?:doorfresh-co)(?:\.git)?\b'),
    'private Drive folder reference': re.compile(r'(?i)(?:drive\.google\.com/drive/(?:u/\d+/)?folders/|docs\.google\.com/document/d/)[A-Za-z0-9_-]{15,}'),
}
failures = []
for path in sorted(ROOT.rglob('*')):
    if not path.is_file() or '.git' in path.relative_to(ROOT).parts:
        continue
    rel = path.relative_to(ROOT)
    if rel in SKIP:
        continue
    try:
        content = path.read_text(encoding='utf-8')
    except UnicodeError:
        failures.append(f'{rel}: non-text file not approved for publication')
        continue
    for label, pattern in RULES.items():
        if pattern.search(content):
            failures.append(f'{rel}: {label}')
if failures:
    print('FAIL: publication security scan blocked:', file=sys.stderr)
    for issue in failures:
        print(f' - {issue}', file=sys.stderr)
    sys.exit(1)
print('PASS: no recognized credential patterns or private service references (manual review still required)')
