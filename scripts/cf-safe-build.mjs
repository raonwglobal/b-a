#!/usr/bin/env node
/**
 * Cloudflare build: mirror full b/a UI from https://www.bambooasia.biz into out/
 * then patch contact submit to POST /api/contact.
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, rmSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const outDir = join(root, 'out');
const SRC = process.env.BA_MIRROR_URL || 'https://www.bambooasia.biz';

console.log('[cf-safe-build] Mirroring full UI from', SRC);

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
  console.log('[cf-safe-build] wrote', rel, typeof content === 'string' ? content.length : content.length);
}

function extractAssetPaths(html) {
  const paths = new Set();
  const re = /(?:href|src)=["'](\/_next\/static\/[^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) paths.add(m[1]);
  return [...paths];
}

async function main() {
  // clean out (keep nothing stale)
  if (existsSync(outDir)) {
    rmSync(outDir, { recursive: true, force: true });
  }
  ensureDir(outDir);

  let html = await fetchText(SRC.endsWith('/') ? SRC : SRC + '/');

  // site defaults
  html = html
    .replaceAll('contact@b-a.asia', 'info@bambooasia.biz')
    .replaceAll('b-a.asia', 'b-a.bambooasia.biz');

  const assets = extractAssetPaths(html);
  console.log('[cf-safe-build] assets', assets.length);

  for (const path of assets) {
    const url = SRC.replace(/\/$/, '') + path;
    try {
      const buf = await fetchBuffer(url);
      let body = buf;
      // patch page chunk: submit → /api/contact
      if (path.includes('/app/page-') && path.endsWith('.js')) {
        let js = buf.toString('utf8');
        if (js.includes('onClick:()=>c(!0)')) {
          js = js.replace(
            'onClick:()=>c(!0)',
            'onClick:()=>{c(!0);try{fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})}catch(e){}}'
          );
        }
        js = js.replace(
          '제출 시 실행안 초안이 생성됩니다. 실제 전송 없이 로컬 미리보기로 확인 후 복사할 수 있습니다.',
          '제출 시 문의가 접수되며 실행안 초안을 미리보기로 확인할 수 있습니다.'
        );
        js = js
          .replaceAll('contact@b-a.asia', 'info@bambooasia.biz')
          .replaceAll('b-a.asia', 'b-a.bambooasia.biz');
        body = Buffer.from(js, 'utf8');
      }
      writeOut(path.replace(/^\//, ''), body);
    } catch (e) {
      console.error('[cf-safe-build] asset fail', path, e.message);
      throw e;
    }
  }

  // inject site meta bridge
  if (!html.includes('__BA_CONTACT_API__')) {
    html = html.replace(
      '</body>',
      `<script>window.__BA_CONTACT_API__='/api/contact';window.__BA_SITE__='https://b-a.bambooasia.biz';window.__BA_CONTACT_EMAIL__='info@bambooasia.biz';</script></body>`
    );
  }

  writeOut('index.html', html);

  if (!existsSync(join(outDir, 'index.html'))) {
    console.error('[cf-safe-build] FATAL: out/index.html missing');
    process.exit(1);
  }

  console.log('[cf-safe-build] OK — full UI mirrored from', SRC);
  console.log('[cf-safe-build] Output directory: out');
}

main().catch((e) => {
  console.error('[cf-safe-build] FAILED', e);
  process.exit(1);
});
