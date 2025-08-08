#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  let repoRoot = '';
  try {
    repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  } catch (_) {
    repoRoot = path.join(__dirname, '..');
  }

  const version = fs.readFileSync(path.join(repoRoot, 'VERSION'), 'utf8').trim();
  const msgFile = process.argv[2];
  if (!msgFile) {
    process.exit(0);
  }
  const original = fs.readFileSync(msgFile, 'utf8');

  const prefix = `v${version}:`;
  const hasPrefix = original.startsWith(prefix);
  const hasAnyVersionPrefix = /^v\d+\.\d+\.\d+:/.test(original);

  if (!hasPrefix) {
    const cleaned = hasAnyVersionPrefix
      ? original.replace(/^v\d+\.\d+\.\d+:/, prefix)
      : `${prefix} ${original}`;
    fs.writeFileSync(msgFile, cleaned);
    console.log(`✍️  Commit message adjusted to include version prefix: ${prefix}`);
  } else {
    console.log('✅ Commit message has correct version prefix');
  }

  process.exit(0);
} catch (e) {
  console.error('⚠️  commit-msg hook warning:', e?.message || e);
  process.exit(0);
} 