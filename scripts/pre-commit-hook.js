#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Robust repo root detection
  let repoRoot = '';
  try {
    repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  } catch (_) {
    repoRoot = path.join(__dirname, '..', '..');
  }
  process.chdir(repoRoot);

  console.log('🔍 Pre-commit hook: enforcing version policy...');

  // Ensure VERSION exists and valid
  const versionPath = path.join(repoRoot, 'VERSION');
  if (!fs.existsSync(versionPath)) {
    console.error('❌ VERSION file not found at repo root');
    process.exit(1);
  }
  const currentVersionRaw = fs.readFileSync(versionPath, 'utf8').trim();
  const semverRe = /^\d+\.\d+\.\d+$/;
  if (!semverRe.test(currentVersionRaw)) {
    console.error(`❌ VERSION file must contain semantic version (MAJOR.MINOR.PATCH), got: ${currentVersionRaw}`);
    process.exit(1);
  }

  // Check if VERSION is staged for commit
  const staged = execSync('git diff --name-only --cached', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  const isVersionStaged = staged.includes('VERSION');

  let newVersion = currentVersionRaw;

  if (!isVersionStaged) {
    // Auto-bump PATCH
    const [maj, min, pat] = currentVersionRaw.split('.').map(Number);
    newVersion = `${maj}.${min}.${pat + 1}`;
    fs.writeFileSync(versionPath, newVersion + '\n');
    console.log(`🔼 Auto-bumped VERSION: ${currentVersionRaw} → ${newVersion}`);
  } else {
    console.log('✅ VERSION is staged; will sync other files');
  }

  // Always sync other files to VERSION
  try {
    execSync('npm run update-version', { stdio: 'inherit' });
  } catch (e) {
    console.error('❌ Failed to sync versions via npm run update-version');
    process.exit(1);
  }

  // Stage updated files
  try {
    execSync('git add VERSION frontend/src/MainApp.tsx package.json frontend/package.json', { stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️  git add failed for one or more files (might be missing)');
  }

  console.log('✅ Version policy enforced successfully');
  process.exit(0);
} catch (err) {
  console.error('❌ Pre-commit hook error:', err?.message || err);
  process.exit(1);
} 