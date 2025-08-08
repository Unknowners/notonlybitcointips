#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-commit hook: Checking version consistency...');

// Перевіряємо чи VERSION файл змінився
const versionFile = path.join(__dirname, '..', '..', 'VERSION');
const currentVersion = fs.readFileSync(versionFile, 'utf8').trim();

// Перевіряємо версію в MainApp.tsx
const mainAppFile = path.join(__dirname, '..', '..', 'frontend/src/MainApp.tsx');
const mainAppContent = fs.readFileSync(mainAppFile, 'utf8');
const versionInMainApp = mainAppContent.match(/Version (\d+\.\d+\.\d+)/);

if (versionInMainApp && versionInMainApp[1] !== currentVersion) {
  console.log(`⚠️  Version mismatch detected!`);
  console.log(`   VERSION file: ${currentVersion}`);
  console.log(`   MainApp.tsx: ${versionInMainApp[1]}`);
  console.log(`🔄 Auto-fixing version consistency...`);
  
  try {
    execSync('npm run update-version', { stdio: 'inherit' });
    console.log('✅ Version consistency restored!');
  } catch (error) {
    console.error('❌ Failed to update version:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Version consistency check passed!');
} 