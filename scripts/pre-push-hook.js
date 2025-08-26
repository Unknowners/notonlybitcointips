#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');

function run(cmd, opts = {}) {
  console.log(`▶ ${cmd}`);
  const r = spawnSync(cmd, { shell: true, stdio: 'inherit', ...opts });
  if (r.status !== 0) {
    throw new Error(`Command failed: ${cmd}`);
  }
}

try {
  // Ensure local dfx is running
  try {
    execSync('dfx ping 127.0.0.1:4943', { stdio: 'ignore' });
  } catch (_) {
    console.log('🔧 Starting local dfx...');
    run('dfx start --background');
    run('dfx deploy');
  }

  // API tests
  run('npm run test:api');

  // Frontend E2E tests
  run('cd frontend && npm run test:e2e');

  console.log('✅ pre-push checks passed. Proceeding with push.');
  process.exit(0);
} catch (e) {
  console.error('❌ pre-push checks failed:', e?.message || e);
  console.error('Push aborted. Fix tests and try again.');
  process.exit(1);
} 