#!/usr/bin/env node
/**
 * b-a static build
 * Homepage: scripts/full-page.html (+ optional .partN.b64 gzip) → out/index.html
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outDir = join(root, 'out');
const FULL = join(root, 'scripts', 'full-page.html');
const I18N = join(root, 'scripts', 'i18n.js');

console.log('[cf-safe-build] consulting UI from scripts/full-page.html');

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
function loadFullPage() {
  if (existsSync(FULL)) return readFileSync(FULL, 'utf8');
  const scriptsDir = join(root, 'scripts');
  const parts = readdirSync(scriptsDir)
    .filter((f) => /^full-page\.part\d+\.b64$/.test(f))
    .sort((a, b) => Number(a.match(/part(\d+)/)[1]) - Number(b.match(/part(\d+)/)[1]));
  if (parts.length) {
    const b64 = parts.map((f) => readFileSync(join(scriptsDir, f), 'utf8')).join('').replace(/\s+/g, '');
    return gunzipSync(Buffer.from(b64, 'base64')).toString('utf8');
  }
  return null;
}
function loadDigitalCard() {
  const plain = join(root, 'scripts', 'digital-card.html');
  if (existsSync(plain)) return readFileSync(plain, 'utf8');
  return null;
}

async function main() {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);

  const html = loadFullPage();
  if (!html) {
    console.error('[cf-safe-build] FATAL: scripts/full-page.html missing');
    process.exit(1);
  }
  writeOut('index.html', scrub(html));
  if (existsSync(I18N)) writeOut('i18n.js', readFileSync(I18N, 'utf8'));

  const card = loadDigitalCard();
  if (card) writeOut('card/index.html', scrub(card));

  writeOut('404.html', '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem"><h1>404</h1><p><a href="/">b/a home</a></p></body></html>');
  console.log('[cf-safe-build] done');
}
main().catch((e) => { console.error(e); process.exit(1); });
