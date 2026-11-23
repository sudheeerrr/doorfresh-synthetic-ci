'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.resolve(__dirname, '../public');
const routes = new Map([
  ['/', {file: 'index.html', type: 'text/html; charset=utf-8'}],
  ['/manifest.webmanifest', {file: 'manifest.webmanifest', type: 'application/manifest+json'}],
  ['/service-worker.js', {file: 'service-worker.js', type: 'text/javascript; charset=utf-8'}]
]);
const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, {'Allow': 'GET, HEAD'});
    res.end();
    return;
  }
  const target = (req.url || '').split('?')[0];
  const route = routes.get(target);
  if (!route) {
    res.writeHead(404, {'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff'});
    res.end('Not found');
    return;
  }
  const bytes = fs.readFileSync(path.join(publicDir, route.file));
  res.writeHead(200, {
    'Content-Type': route.type,
    'Content-Length': String(bytes.length),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
  });
  res.end(req.method === 'HEAD' ? undefined : bytes);
});
if (require.main === module) {
  const port = Number(process.env.PORT || '0');
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT');
  server.listen(port, '127.0.0.1', () => console.log(`READY ${server.address().port}`));
}
module.exports = {server};
