#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const gitHooksDir = path.join(repoRoot, '.git', 'hooks');

if (!fs.existsSync(gitHooksDir)) {
  console.error('❌ .git/hooks not found. Run inside a Git repository.');
  process.exit(1);
}

function installHook(srcRelative, destName) {
  const src = path.join(repoRoot, 'scripts', srcRelative);
  const dest = path.join(gitHooksDir, destName);
  fs.copyFileSync(src, dest);
  fs.chmodSync(dest, 0o755);
  console.log(`✅ Installed hook: ${destName}`);
}

try {
  installHook('pre-commit-hook.js', 'pre-commit');
  installHook('commit-msg-hook.js', 'commit-msg');
  console.log('🎉 Git hooks installed successfully');
  process.exit(0);
} catch (e) {
  console.error('❌ Failed to install git hooks:', e?.message || e);
  process.exit(1);
} 