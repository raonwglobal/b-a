#!/usr/bin/env node
/**
 * b-a static build
 *
 * Homepage source of truth:
 *   scripts/full-page.html + scripts/i18n.js  →  out/index.html + out/i18n.js
 *
 * Do NOT mirror www.bambooasia.biz by default (product site changed).
 * Optional digital card: scripts/digital-card.html → out/card/index.html
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outDir = join(root, 'out');
const FULL = join(root, 'scripts', 'full-page.html');
const I18N = join(root, 'scripts', 'i18n.js');
const MIRROR = process.env.BA_MIRROR_URL;

console.log('[cf-safe-build] consulting UI from scripts/full-page.html + i18n.js');

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

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
    .replaceAll('contact@b-a.asia', 'info@bambooasia.biz')
    .replaceAll('noreply@b-a.asia', 'noreply@bambooasia.biz');
}

function loadDigitalCard() {
  const plain = join(root, 'scripts', 'digital-card.html');
  if (existsSync(plain)) return readFileSync(plain, 'utf8');

  const single = join(root, 'scripts', 'digital-card.html.gz.b64');
  if (existsSync(single)) {
    const b64 = readFileSync(single, 'utf8').replace(/\s+/g, '');
    return gunzipSync(Buffer.from(b64, 'base64')).toString('utf8');
  }

  const scriptsDir = join(root, 'scripts');
  if (!existsSync(scriptsDir)) return null;
  const parts = readdirSync(scriptsDir)
    .filter((f) => /^digital-card\.part\d+\.b64$/.test(f))
    .sort((a, b) => Number(a.match(/part(\d+)/)[1]) - Number(b.match(/part(\d+)/)[1]));
  if (parts.length) {
    const b64 = parts.map((f) => readFileSync(join(scriptsDir, f), 'utf8')).join('').replace(/\s+/g, '');
    return gunzipSync(Buffer.from(b64, 'base64')).toString('utf8');
  }
  return null;
}

async function main() {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);

  if (MIRROR) {
    console.warn('[cf-safe-build] WARNING: BA_MIRROR_URL set — may not be consulting site');
    const res = await fetch(MIRROR.replace(/\/$/, '') + '/', {
      headers: { 'User-Agent': 'b-a-build/1.0' },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`Mirror fetch failed ${res.status}`);
    writeOut('index.html', scrub(await res.text()));
  } else {
    if (!existsSync(FULL)) {
      console.error('[cf-safe-build] FATAL: scripts/full-page.html missing');
      process.exit(1);
    }
    if (!existsSync(I18N)) {
      console.error('[cf-safe-build] FATAL: scripts/i18n.js missing (page would render empty)');
      process.exit(1);
    }

    let html = scrub(readFileSync(FULL, 'utf8'));
    const i18nSrc = readFileSync(I18N, 'utf8');

    // Always ship standalone i18n.js
    writeOut('i18n.js', i18nSrc);

    // Inline I18N so content renders even if /i18n.js is blocked/cached wrong
    if (html.includes('<script src="/i18n.js"></script>')) {
      html = html.replace(
        '<script src="/i18n.js"></script>',
        `<script>\n${i18nSrc}\n</script>`
      );
      console.log('[cf-safe-build] inlined i18n.js into index.html');
    } else if (!html.includes('window.I18N') && !html.includes('I18N[')) {
      // no reference yet — inject before first app script
      html = html.replace('</head>', `<script>\n${i18nSrc}\n</script></head>`);
    }

    if (!html.includes('__BA_SITE__')) {
      html = html.replace(
        '</body>',
        `<script>window.__BA_SITE__='https://b-a.bambooasia.biz';window.__BA_CONTACT_EMAIL__='info@bambooasia.biz';</script></body>`
      );
    }

    if (/Circular Materials/i.test(html) && !/Business Execution/i.test(html)) {
      console.error('[cf-safe-build] FATAL: wrong product content');
      process.exit(1);
    }

    writeOut('index.html', html);
  }

  const card = loadDigitalCard();
  if (card) {
    ensureDir(join(outDir, 'card'));
    writeFileSync(join(outDir, 'card', 'index.html'), card, 'utf8');
    console.log('[cf-safe-build] wrote card/index.html');
  }

  if (!existsSync(join(outDir, 'index.html'))) {
    console.error('[cf-safe-build] FATAL: out/index.html missing');
    process.exit(1);
  }

  // Sanity: built index must contain I18N data or empty shells will show
  const built = readFileSync(join(outDir, 'index.html'), 'utf8');
  if (!MIRROR && !built.includes('window.I18N') && !existsSync(join(outDir, 'i18n.js'))) {
    console.error('[cf-safe-build] FATAL: I18N not present in build output');
    process.exit(1);
  }

  console.log('[cf-safe-build] OK');
  console.log('[cf-safe-build] UI: Vietnam Business Execution Platform');
  console.log('[cf-safe-build] Routes: / · /i18n.js · /card/ (if present)');
}

main().catch((e) => {
  console.error('[cf-safe-build] FAILED', e);
  process.exit(1);
});
