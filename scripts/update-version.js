#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Читаємо версію з VERSION файлу
const versionFile = path.join(__dirname, '..', 'VERSION');
const version = fs.readFileSync(versionFile, 'utf8').trim();

console.log(`🔄 Оновлюю версію ${version} в усіх файлах...`);

// Файли де потрібно оновити версію
const filesToUpdate = [
  'frontend/src/MainApp.tsx',
  'package.json',
  'frontend/package.json'
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (filePath.includes('MainApp.tsx')) {
      // Оновлюємо версію в React компоненті
      content = content.replace(
        /Version \d+\.\d+\.\d+/g,
        `Version ${version}`
      );
    } else if (filePath.includes('package.json')) {
      // Оновлюємо версію в package.json
      content = content.replace(
        /"version": "\d+\.\d+\.\d+"/g,
        `"version": "${version}"`
      );
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Оновлено: ${filePath}`);
  } else {
    console.log(`⚠️  Файл не знайдено: ${filePath}`);
  }
});

console.log(`🎉 Версія ${version} оновлена в усіх файлах!`); 