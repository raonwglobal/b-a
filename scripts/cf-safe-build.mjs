#!/usr/bin/env node
/**
 * Build static out/ from full multi-language page (KR/EN/VI/JP).
 * Source of truth: scripts/full-page.html
 * Contact: info@bambooasia.biz (real address — never labeled as example)
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outDir = join(root, 'out');
const srcPage = join(root, 'scripts', 'full-page.html');

console.log('[cf-safe-build] Building multi-language static site (KR/EN/VI/JP)');

if (!existsSync(srcPage)) {
  console.error('[cf-safe-build] FATAL: scripts/full-page.html missing');
  process.exit(1);
}

let html = readFileSync(srcPage, 'utf8');

// Hard guard: never ship email labeled as example
html = html
  .replaceAll('info@bambooasia.biz (예시)', 'info@bambooasia.biz')
  .replaceAll('info@bambooasia.biz(예시)', 'info@bambooasia.biz');

if (!html.includes('info@bambooasia.biz')) {
  console.error('[cf-safe-build] FATAL: contact email missing');
  process.exit(1);
}

for (const needle of [
  'Your Entire Vietnam Entry',
  'ベトナム進出',
  'Toàn bộ hành trình',
  '베트남 진출의 모든 과정',
]) {
  if (!html.includes(needle)) {
    console.error('[cf-safe-build] FATAL: missing language content:', needle);
    process.exit(1);
  }
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'index.html'), html, 'utf8');

console.log('[cf-safe-build] OK out/index.html', html.length, 'bytes');
console.log('[cf-safe-build] Languages: KR EN VI JP · contact: info@bambooasia.biz');
process.exit(0);
