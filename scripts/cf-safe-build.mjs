#!/usr/bin/env node
/**
 * 1) Mirror www.bambooasia.biz → out/
 * 2) Digital card → out/card/index.html
 *    Prefer scripts/digital-card.html
 *    Or scripts/digital-card.html.gz.b64
 *    Or scripts/digital-card.partN.b64 (concat in order)
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outDir = join(root, 'out');
const SRC = (process.env.BA_MIRROR_URL || 'https://www.bambooasia.biz').replace(/\/$/, '');

console.log('[cf-safe-build] UI mirror from', SRC);

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'b-a-build/1.0' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
  return await res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'b-a-build/1.0' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function writeOut(rel, content) {
  const p = join(outDir, rel);
  ensureDir(dirname(p));
  writeFileSync(p, content, typeof content === 'string' ? 'utf8' : undefined);
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
    .replaceAll('contact@b-a.asia', 'info@bambooasia.biz');
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

  let html = scrubContact(await fetchText(SRC + '/'));
  const assets = extractAssetPaths(html);
  console.log('[cf-safe-build] assets', assets.length);

  for (const path of assets) {
    let body = await fetchBuffer(SRC + path);
    if (path.includes('/app/page-') && path.endsWith('.js')) {
      let js = scrubContact(body.toString('utf8'));
      if (js.includes('onClick:()=>c(!0)')) {
        js = js.replace(
          'onClick:()=>c(!0)',
          'onClick:()=>{c(!0);try{fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})}catch(e){}}'
        );
      }
      body = Buffer.from(js, 'utf8');
    }
    writeOut(path.replace(/^\//, ''), body);
  }

  if (!html.includes('__BA_SITE__')) {
    html = html.replace(
      '</body>',
      `<script>window.__BA_SITE__='https://b-a.bambooasia.biz';</script></body>`
    );
  }
  writeOut('index.html', html);

  const card = loadDigitalCard();
  if (card) {
    ensureDir(join(outDir, 'card'));
    writeFileSync(join(outDir, 'card', 'index.html'), card, 'utf8');
    console.log('[cf-safe-build] wrote card/index.html');
  } else {
    console.warn('[cf-safe-build] WARN: no digital-card source under scripts/');
  }

  console.log('[cf-safe-build] OK — / and /card/');
}

main().catch((e) => {
  console.error('[cf-safe-build] FAILED', e);
  process.exit(1);
});
