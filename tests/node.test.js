'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {server} = require('../scripts/server');

async function withServer(fn) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await fn(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve())); }
}

test('synthetic HTTP storefront and headers', async () => {
  await withServer(async base => {
    const res = await fetch(base + '/');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.match(await res.text(), /Synthetic CI fixture ready/);
  });
});
test('unknown route and unsupported method are safely rejected', async () => {
  await withServer(async base => {
    assert.equal((await fetch(base + '/admin')).status, 404);
    assert.equal((await fetch(base + '/', {method: 'POST'})).status, 405);
    assert.equal((await fetch(base + '/', {method: 'HEAD'})).status, 200);
  });
});

const {boundedCollector} = require('../scripts/browser-test');
test('browser diagnostics preserve first and last errors after a large crash stack', () => {
  const capture = boundedCollector(16, 16);
  capture.push(Buffer.from('FIRST_ERROR: bad'));
  capture.push(Buffer.from('x'.repeat(20000)));
  capture.push(Buffer.from('LAST_STACK_END!'));
  const output = capture.format();
  assert.match(output, /FIRST_ERROR/);
  assert.match(output, /LAST_STACK_END!/);
  assert.ok(output.length < 300);
  assert.match(output, /TOTAL STDERR: 20031 bytes/);
});
test('browser diagnostics handle empty and short stderr safely', () => {
  const capture = boundedCollector(32, 32);
  assert.equal(capture.format(), '(no stderr output)');
  capture.push(Buffer.from('startup failure'));
  assert.equal(capture.format(), 'startup failure');
});
