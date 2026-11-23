'use strict';
const cp = require('node:child_process');
const commands = [
  ['Node', 'node', ['--version']],
  ['Python', 'python3', ['--version']],
  ['Flutter', 'flutter', ['--version']],
  ['Android SDK', 'sdkmanager', ['--version']],
  ['iOS/Xcode', 'xcodebuild', ['-version']]
];
for (const [name, command, args] of commands) {
  const out = cp.spawnSync(command, args, {encoding: 'utf8', timeout: 5000});
  const value = out.error ? 'UNAVAILABLE (not tested)' : out.status === 0 ? 'PRESENT (tooling only)' : `NOT VERIFIED (exit ${out.status})`;
  console.log(`${name}: ${value}`);
}
console.log('Flutter/Android/iOS builds are NOT included. Linux-hosted CI cannot validate Xcode/iOS builds.');
