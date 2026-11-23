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
