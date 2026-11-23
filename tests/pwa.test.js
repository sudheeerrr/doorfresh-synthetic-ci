'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../public');
test('synthetic PWA manifest structure', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest')));
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(x => x.sizes === '192x192'));
});
test('service-worker parses and does not intercept non-GET methods', () => {
  const source = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  new (require('node:vm').Script)(source);
  assert.match(source, /request\.method !== 'GET'/);
});
