#!/usr/bin/env node
/**
 * b-a static build — recovers UI from git history when full-page.html is PLACEHOLDER.
 * Applies CTA label (상담하기) and header btn-cta vertical alignment.
 * Builds digital cards at /card/ (not in main nav).
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { buildDigitalCards } from './build-digital-cards.mjs';

const root = process.cwd();
const outDir = join(root, 'out');
const FULL = join(root, 'scripts', 'full-page.html');
const I18N = join(root, 'scripts', 'i18n.js');
const FULL_GZ_B64 = join(root, 'scripts', 'full-page.html.gz.b64');

console.log('[cf-safe-build] consulting UI');

function ensureDir(p) { mkdirSync(p, { recursive: true }); }
function writeOut(rel, content) {
  const p = join(outDir, rel);
  ensureDir(dirname(p));
  writeFileSync(p, content, 'utf8');
  console.log('[cf-safe-build] wrote', rel, `(${Buffer.byteLength(content)}b)`);
}

function scrub(text) {
  let out = text
    .replaceAll('info@bambooasia.biz (예시)', 'info@bambooasia.biz')
    .replaceAll('hello@b-a.asia (예시)', 'info@bambooasia.biz')
    .replaceAll('hello@b-a.asia', 'info@bambooasia.biz')
    .replaceAll('contact@b-a.asia', 'info@bambooasia.biz')
    .replaceAll('>실행 상담하기<', '>상담하기<')
    .replaceAll('>실행 상담하기 →<', '>상담하기 →<')
    .replaceAll('"ctaTop": "실행 상담하기"', '"ctaTop": "상담하기"')
    .replaceAll('"heroCTA1": "실행 상담하기"', '"heroCTA1": "상담하기"');
  out = out.replace(
    '.btn-cta{height:40px;padding:0 1.1rem;border-radius:999px;background:#16A34A;color:#fff;border:0;font-size:13px;font-weight:600}',
    '.btn-cta{height:40px;padding:0 1.1rem;border-radius:999px;background:#16A34A;color:#fff;border:0;font-size:13px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;line-height:1;white-space:nowrap}'
  );
  return out;
}

async function loadFullPage() {
  if (existsSync(FULL)) {
    const html = readFileSync(FULL, 'utf8');
    const bad = !html || html.trim() === 'PLACEHOLDER' || html.length < 500;
    if (!bad) {
      console.log('[cf-safe-build] loaded full-page.html');
      return html;
    }
    console.warn('[cf-safe-build] full-page.html invalid, recovering');
  }
  if (existsSync(FULL_GZ_B64)) {
    try {
      const b64 = readFileSync(FULL_GZ_B64, 'utf8').replace(/\s+/g, '');
      const html = gunzipSync(Buffer.from(b64, 'base64')).toString('utf8');
      if (html && html.length > 1000) {
        console.log('[cf-safe-build] loaded gz.b64');
        return html;
      }
    } catch (e) {
      console.warn('[cf-safe-build] gz failed', e.message);
    }
  }
  const histUrl = 'https://raw.githubusercontent.com/raonwglobal/b-a/0a7663be/scripts/full-page.html';
  console.log('[cf-safe-build] fetching recovery UI from git history');
  const res = await fetch(histUrl);
  if (!res.ok) throw new Error('history fetch failed ' + res.status);
  const html = await res.text();
  if (!html || html.length < 1000) throw new Error('history UI empty');
  console.log('[cf-safe-build] recovered from 0a7663be (' + html.length + ' bytes)');
  return html;
}

async function main() {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);
  const raw = await loadFullPage();
  const html = scrub(raw);
  writeOut('index.html', html);
  if (existsSync(I18N)) {
    let i18n = readFileSync(I18N, 'utf8')
      .replaceAll('"ctaTop": "실행 상담하기"', '"ctaTop": "상담하기"')
      .replaceAll('"heroCTA1": "실행 상담하기"', '"heroCTA1": "상담하기"');
    writeOut('i18n.js', i18n);
  }
  writeOut('404.html', '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem"><h1>404</h1><p><a href="/">b/a home</a></p></body></html>');
  console.log('[cf-safe-build] done | EXECUTION=', html.includes('EXECUTION'));
  try {
    const card = await buildDigitalCards();
    console.log('[cf-safe-build] digital cards', card);
  } catch (e) {
    console.warn('[cf-safe-build] digital cards failed', e.message);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
