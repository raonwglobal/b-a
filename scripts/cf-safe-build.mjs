#!/usr/bin/env node
/**
 * b-a static build
 * Prefer scripts/full-page.partN.b64 (gzip of zip-faithful UI) when 4 parts exist;
 * else scripts/full-page.html
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
      console.log('[cf-safe-build] loaded UI from full-page.part*.b64 (' + parts.length + ' parts)');
      return html;
    }
  } catch (e) {
    console.warn('[cf-safe-build] parts decode failed', e.message);
  }
  return null;
}
function loadFullPage() {
  const fromParts = loadFromParts();
  if (fromParts) return fromParts;
  if (existsSync(FULL)) {
    console.log('[cf-safe-build] loaded UI from full-page.html');
    return readFileSync(FULL, 'utf8');
  }
  return null;
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
