#!/usr/bin/env node
/**
 * b-a static build
 *
 * IMPORTANT:
 * Do NOT mirror https://www.bambooasia.biz by default.
 * That domain changed to "Bamboo Circular Materials" and is no longer
 * the Vietnam Business Execution Platform UI.
 *
 * Homepage source of truth:
 *   scripts/full-page.html  →  out/index.html
 *
 * Optional digital card:
 *   scripts/digital-card.html (or .gz.b64 / partN.b64)  →  out/card/index.html
 *
 * Emergency only (will pull wrong product site):
 *   BA_MIRROR_URL=https://... npm run build
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outDir = join(root, 'out');
const FULL = join(root, 'scripts', 'full-page.html');
const MIRROR = process.env.BA_MIRROR_URL; // optional, not default

console.log('[cf-safe-build] restoring consulting UI from scripts/full-page.html');

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

function writeOut(rel, content) {
  const p = join(outDir, rel);
  ensureDir(dirname(p));
  writeFileSync(p, typeof content === 'string' ? content : content, {
    encoding: typeof content === 'string' ? 'utf8' : undefined,
  });
  console.log('[cf-safe-build] wrote', rel, typeof content === 'string' ? `(${content.length}b)` : '');
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

async function mirrorExternal(url) {
  console.warn('[cf-safe-build] WARNING: BA_MIRROR_URL is set — live mirror may not be the consulting site');
  const res = await fetch(url.replace(/\/$/, '') + '/', {
    headers: { 'User-Agent': 'b-a-build/1.0' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Mirror fetch failed ${res.status}`);
  return scrub(await res.text());
}

async function main() {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);

  let html;
  if (MIRROR) {
    html = await mirrorExternal(MIRROR);
  } else {
    if (!existsSync(FULL)) {
      console.error('[cf-safe-build] FATAL: scripts/full-page.html missing');
      process.exit(1);
    }
    html = scrub(readFileSync(FULL, 'utf8'));
  }

  // Ensure site markers
  if (!html.includes('__BA_SITE__')) {
    html = html.replace(
      '</body>',
      `<script>window.__BA_SITE__='https://b-a.bambooasia.biz';window.__BA_CONTACT_EMAIL__='info@bambooasia.biz';</script></body>`
    );
  }

  // Guard: refuse obvious wrong product page unless forced
  if (!MIRROR && /Circular Materials/i.test(html) && !/Business Execution/i.test(html)) {
    console.error('[cf-safe-build] FATAL: full-page.html looks like wrong product (Circular Materials)');
    process.exit(1);
  }

  writeOut('index.html', html);

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

  console.log('[cf-safe-build] OK');
  console.log('[cf-safe-build] UI: Vietnam Business Execution Platform (scripts/full-page.html)');
  console.log('[cf-safe-build] Routes: /  ·  /card/ (if source present)');
}

main().catch((e) => {
  console.error('[cf-safe-build] FAILED', e);
  process.exit(1);
});
