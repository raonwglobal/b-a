#!/usr/bin/env node
/**
 * b-a static build
 * Load order:
 *  1) scripts/full-page.chunk*.txt (plain UTF-8 pieces of zip-faithful UI)
 *  2) scripts/full-page.part*.b64 (gzip+base64)
 *  3) scripts/full-page.html
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outDir = join(root, 'out');
const FULL = join(root, 'scripts', 'full-page.html');
const I18N = join(root, 'scripts', 'i18n.js');

console.log('[cf-safe-build] consulting UI');

function ensureDir(p) { mkdirSync(p, { recursive: true }); }
function writeOut(rel, content) {
  const p = join(outDir, rel);
  ensureDir(dirname(p));
  writeFileSync(p, content, typeof content === 'string' ? 'utf8' : undefined);
  console.log('[cf-safe-build] wrote', rel, typeof content === 'string' ? `(${Buffer.byteLength(content)}b)` : '');
}
function scrub(text) {
  return text
    .replaceAll('info@bambooasia.biz (예시)', 'info@bambooasia.biz')
    .replaceAll('info@bambooasia.biz(예시)', 'info@bambooasia.biz')
    .replaceAll('hello@b-a.kr (예시)', 'info@bambooasia.biz')
    .replaceAll('hello@b-a.kr', 'info@bambooasia.biz')
    .replaceAll('contact@b-a.asia', 'info@bambooasia.biz')
    .replaceAll('noreply@b-a.asia', 'noreply@bambooasia.biz');
}
function loadFromChunks() {
  const scriptsDir = join(root, 'scripts');
  if (!existsSync(scriptsDir)) return null;
  const parts = readdirSync(scriptsDir)
    .filter((f) => /^full-page\.chunk\d+\.txt$/.test(f))
    .sort((a, b) => Number(a.match(/chunk(\d+)/)[1]) - Number(b.match(/chunk(\d+)/)[1]));
  if (parts.length < 2) return null;
  const html = parts.map((f) => readFileSync(join(scriptsDir, f), 'utf8')).join('');
  if (html.includes('site-footer') && html.includes('EXECUTION BOARD')) {
    console.log('[cf-safe-build] loaded UI from full-page.chunk*.txt (' + parts.length + ' chunks)');
    return html;
  }
  return null;
}
function loadFromParts() {
  const scriptsDir = join(root, 'scripts');
  if (!existsSync(scriptsDir)) return null;
  const parts = readdirSync(scriptsDir)
    .filter((f) => /^full-page\.part\d+\.b64$/.test(f))
    .sort((a, b) => Number(a.match(/part(\d+)/)[1]) - Number(b.match(/part(\d+)/)[1]));
  if (parts.length < 4) return null;
  const b64 = parts.map((f) => readFileSync(join(scriptsDir, f), 'utf8')).join('').replace(/\s+/g, '');
  try {
    const html = gunzipSync(Buffer.from(b64, 'base64')).toString('utf8');
    if (html.includes('site-footer') && html.includes('EXECUTION BOARD')) {
      console.log('[cf-safe-build] loaded UI from full-page.part*.b64');
      return html;
    }
  } catch (e) {
    console.warn('[cf-safe-build] parts decode failed', e.message);
  }
  return null;
}
function loadFullPage() {
  return loadFromChunks() || loadFromParts() || (existsSync(FULL) ? readFileSync(FULL, 'utf8') : null);
}

async function main() {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);
  const html = loadFullPage();
  if (!html) {
    console.error('[cf-safe-build] FATAL: no full-page source');
    process.exit(1);
  }
  writeOut('index.html', scrub(html));
  if (existsSync(I18N)) writeOut('i18n.js', readFileSync(I18N, 'utf8'));
  writeOut('404.html', '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem"><h1>404</h1><p><a href="/">b/a home</a></p></body></html>');
  console.log('[cf-safe-build] done');
}
main().catch((e) => { console.error(e); process.exit(1); });
