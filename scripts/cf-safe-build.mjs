#!/usr/bin/env node
/**
 * Build out/ from scripts/full-page.html + scripts/i18n.js
 * KR / EN / VI / JP full page content
 * Contact: info@bambooasia.biz (real — never "예시")
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outDir = join(root, 'out');
const srcPage = join(root, 'scripts', 'full-page.html');
const srcI18n = join(root, 'scripts', 'i18n.js');

console.log('[cf-safe-build] Building multi-language site (KR/EN/VI/JP)');

if (!existsSync(srcPage) || !existsSync(srcI18n)) {
  console.error('[cf-safe-build] FATAL: scripts/full-page.html or scripts/i18n.js missing');
  process.exit(1);
}

let html = readFileSync(srcPage, 'utf8');
let i18n = readFileSync(srcI18n, 'utf8');

html = html
  .replaceAll('info@bambooasia.biz (예시)', 'info@bambooasia.biz')
  .replaceAll('info@bambooasia.biz(예시)', 'info@bambooasia.biz');
i18n = i18n
  .replaceAll('info@bambooasia.biz (예시)', 'info@bambooasia.biz')
  .replaceAll('info@bambooasia.biz(예시)', 'info@bambooasia.biz');

if (i18n.includes('(예시)') && i18n.includes('info@bambooasia.biz')) {
  // only fail if still attached to email pattern
  if (/info@bambooasia\.biz\s*\(예시\)/.test(i18n)) {
    console.error('[cf-safe-build] FATAL: example marker on contact email');
    process.exit(1);
  }
}

for (const needle of [
  'Your Entire Vietnam Entry',
  'ベトナム進出',
  'Toàn bộ hành trình',
  '베트남 진출의 모든 과정',
]) {
  if (!i18n.includes(needle)) {
    console.error('[cf-safe-build] FATAL: missing language content:', needle);
    process.exit(1);
  }
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'index.html'), html, 'utf8');
writeFileSync(join(outDir, 'i18n.js'), i18n, 'utf8');

console.log('[cf-safe-build] OK out/index.html + out/i18n.js');
console.log('[cf-safe-build] Languages: KR EN VI JP · contact: info@bambooasia.biz');
process.exit(0);
