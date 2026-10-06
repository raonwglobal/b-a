#!/usr/bin/env node
/**
 * 1) Mirror https://www.bambooasia.biz UI → out/
 * 2) Digital card → out/card/index.html
 *    Source: scripts/digital-card.html  OR  scripts/digital-card.html.gz.b64
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outDir = join(root, 'out');
const SRC = (process.env.BA_MIRROR_URL || 'https://www.bambooasia.biz').replace(/\/$/, '');
const cardHtml = join(root, 'scripts', 'digital-card.html');
const cardB64 = join(root, 'scripts', 'digital-card.html.gz.b64');

console.log('[cf-safe-build] UI mirror from', SRC);

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'b-a-build/1.0' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
  return await res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'b-a-build/1.0' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function writeOut(rel, content) {
  const p = join(outDir, rel);
  ensureDir(dirname(p));
  if (typeof content === 'string') writeFileSync(p, content, 'utf8');
  else writeFileSync(p, content);
  console.log('[cf-safe-build] wrote', rel);
}

function extractAssetPaths(html) {
  const paths = new Set();
  const re = /(?:href|src)=["'](\/_next\/static\/[^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) paths.add(m[1]);
  return [...paths];
}

function scrubContact(text) {
  return text
    .replaceAll('info@bambooasia.biz (예시)', 'info@bambooasia.biz')
    .replaceAll('info@bambooasia.biz(예시)', 'info@bambooasia.biz')
    .replaceAll('contact@b-a.asia', 'info@bambooasia.biz')
    .replaceAll('noreply@b-a.asia', 'noreply@bambooasia.biz');
}

function loadDigitalCard() {
  if (existsSync(cardHtml)) {
    return readFileSync(cardHtml, 'utf8');
  }
  if (existsSync(cardB64)) {
    const b64 = readFileSync(cardB64, 'utf8').replace(/\s+/g, '');
    const gz = Buffer.from(b64, 'base64');
    return gunzipSync(gz).toString('utf8');
  }
  return null;
}

async function main() {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);

  let html = await fetchText(SRC + '/');
  html = scrubContact(html);

  const assets = extractAssetPaths(html);
  console.log('[cf-safe-build] assets', assets.length);

  for (const path of assets) {
    const url = SRC + path;
    const buf = await fetchBuffer(url);
    let body = buf;

    if (path.includes('/app/page-') && path.endsWith('.js')) {
      let js = scrubContact(buf.toString('utf8'));
      if (js.includes('onClick:()=>c(!0)')) {
        js = js.replace(
          'onClick:()=>c(!0)',
          'onClick:()=>{c(!0);try{fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})}catch(e){}}'
        );
      }
      js = js.replaceAll('info@bambooasia.biz (예시)', 'info@bambooasia.biz');
      body = Buffer.from(js, 'utf8');
    }

    writeOut(path.replace(/^\//, ''), body);
  }

  if (!html.includes('__BA_SITE__')) {
    html = html.replace(
      '</body>',
      `<script>window.__BA_SITE__='https://b-a.bambooasia.biz';window.__BA_CONTACT_EMAIL__='info@bambooasia.biz';</script></body>`
    );
  }
  writeOut('index.html', html);

  const card = loadDigitalCard();
  if (card) {
    ensureDir(join(outDir, 'card'));
    writeFileSync(join(outDir, 'card', 'index.html'), card, 'utf8');
    console.log('[cf-safe-build] wrote card/index.html');
  } else {
    console.warn('[cf-safe-build] WARN: digital card source missing');
  }

  if (!existsSync(join(outDir, 'index.html'))) {
    console.error('[cf-safe-build] FATAL: out/index.html missing');
    process.exit(1);
  }

  console.log('[cf-safe-build] OK — / and /card/');
}

main().catch((e) => {
  console.error('[cf-safe-build] FAILED', e);
  process.exit(1);
});
