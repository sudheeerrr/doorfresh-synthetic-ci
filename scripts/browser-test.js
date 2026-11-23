'use strict';
const cp = require('node:child_process');
const {server} = require('./server');
const {mkdtempSync, rmSync} = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const candidates = [process.env.CI_BROWSER, 'chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable'].filter(Boolean);
function browserCommand() {
  for (const candidate of candidates) {
    const result = cp.spawnSync('which', [candidate], {encoding: 'utf8'});
    if (result.status === 0) return candidate;
  }
  throw new Error(`No Chromium/Chrome executable found (${candidates.join(', ')}). Browser test NOT performed.`);
}
async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const temp = mkdtempSync(path.join(os.tmpdir(), 'synthetic-ci-browser-'));
  try {
    const cmd = browserCommand();
    const url = `http://127.0.0.1:${server.address().port}/`;
    // Headless browser renders only the isolated local fixture. No external pages.
    const args = ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      `--user-data-dir=${temp}`, '--virtual-time-budget=2500', '--dump-dom', url];
    // Do not disable Chromium sandbox on CI or local hosts.
    if (process.getuid?.() === 0) {
      throw new Error('Browser test requires a non-root user with Chromium sandbox available.');
    }
    const run = await new Promise((resolve, reject) => {
      const child = cp.spawn(cmd, args, {stdio: ['ignore', 'pipe', 'pipe']});
      let stdout = '';
      let stderr = '';
      const timer = setTimeout(() => child.kill('SIGKILL'), 30000);
      child.stdout.on('data', chunk => { stdout = (stdout + chunk.toString()).slice(-2 * 1024 * 1024); });
      child.stderr.on('data', chunk => { stderr = (stderr + chunk.toString()).slice(-4000); });
      child.once('error', error => { clearTimeout(timer); reject(error); });
      child.once('close', (status, signal) => { clearTimeout(timer); resolve({status, signal, stdout, stderr}); });
    });
    if (run.status !== 0 || !run.stdout.includes('Synthetic CI fixture ready')) {
      throw new Error(`Browser fixture failed: status=${run.status}, signal=${run.signal}, stderr=${run.stderr.slice(-500)}`);
    }
    console.log(`PASS: Chromium rendered isolated synthetic fixture using ${cmd}`);
  } finally {
    rmSync(temp, {recursive: true, force: true});
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
}
main().catch(err => {console.error(err.message); process.exitCode = 1;});
