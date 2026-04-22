/**
 * fix_literals.js — Fixes broken string literals created by the previous migration.
 * Turns: '${API_BASE_URL}/api/...'  (single-quote, won't interpolate)
 * Into:  `${API_BASE_URL}/api/...`  (backtick template literal, will interpolate)
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');
let totalFixed = 0;

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const fullPath = path.join(dir, f);
    fs.statSync(fullPath).isDirectory() ? walkDir(fullPath, callback) : callback(fullPath);
  });
}

walkDir(srcDir, (filePath) => {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  if (filePath.endsWith('apiConfig.js')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix: '${API_BASE_URL}/...' → `${API_BASE_URL}/...`
  // Pattern: single-quoted string starting with ${API_BASE_URL}
  content = content.replace(/'(\$\{API_BASE_URL\}[^']*)'/g, (match, inner) => {
    return '`' + inner + '`';
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    const fixes = (original.match(/'(\$\{API_BASE_URL\}[^']*)'/g) || []).length;
    totalFixed += fixes;
    console.log(`Fixed ${fixes} literal(s) in: ${path.relative(srcDir, filePath)}`);
  }
});

console.log(`\nDone. Total literals fixed: ${totalFixed}`);
