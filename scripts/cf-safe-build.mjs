#!/usr/bin/env node
/**
 * MAIN SITE ONLY static build.
 * - Recovers UI from gz.b64 / part*.b64 / git history
 * - Writes out/index.html, out/i18n.js, out/404.html, out/_redirects
 * - Does NOT build digital cards (see build-digital-cards.mjs)
 * - Card routes: SPA fallback via _redirects → /card-spa.html?id=:id
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outDir = join(root, 'out');
const scriptsDir = join(root, 'scripts');
const FULL = join(scriptsDir, 'full-page.html');
const I18N = join(scriptsDir, 'i18n.js');
const FULL_GZ_B64 = join(scriptsDir, 'full-page.html.gz.b64');

console.log('[cf-safe-build] main site only (cards are separate)');

function ensureDir(p) { mkdirSync(p, { recursive: true }); }
function writeOut(rel, content) {
  const p = join(outDir, rel);
  ensureDir(dirname(p));
  writeFileSync(p, content, 'utf8');
  console.log('[cf-safe-build] wrote', rel, `(${Buffer.byteLength(content)}b)`);
}

function loadJoinedParts(prefix) {
  const parts = readdirSync(scriptsDir)
    .filter((f) => new RegExp('^' + prefix + '\\.part\\d+\\.b64$').test(f))
    .sort();
  if (!parts.length) return null;
  try {
    const b64 = parts.map((f) => readFileSync(join(scriptsDir, f), 'utf8')).join('').replace(/\s+/g, '');
    const buf = gunzipSync(Buffer.from(b64, 'base64'));
    const text = buf.toString('utf8');
    if (text && text.length > 500) {
      console.log(`[cf-safe-build] loaded ${prefix} from ${parts.length} parts (${text.length}b)`);
      return text;
    }
  } catch (e) {
    console.warn(`[cf-safe-build] ${prefix} parts failed`, e.message);
  }
  return null;
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
    const bad = !html || html.includes('PLACEHOLDER') || html.length < 500;
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
  const fromParts = loadJoinedParts('full-page');
  if (fromParts) return fromParts;
  const histUrl = 'https://raw.githubusercontent.com/raonwglobal/b-a/0a7663be/scripts/full-page.html';
  console.log('[cf-safe-build] fetching recovery UI from git history');
  const res = await fetch(histUrl);
  if (!res.ok) throw new Error('history fetch failed ' + res.status);
  const html = await res.text();
  if (!html || html.length < 1000) throw new Error('history UI empty');
  console.log('[cf-safe-build] recovered from 0a7663be (' + html.length + ' bytes)');
  return html;
}

function loadI18n() {
  if (existsSync(I18N)) {
    const t = readFileSync(I18N, 'utf8');
    if (t.length > 15000 && t.includes('"VI"') && t.includes('footer_brand')) {
      console.log('[cf-safe-build] loaded i18n.js');
      return t;
    }
    console.warn('[cf-safe-build] i18n.js incomplete, trying parts');
  }
  const fromParts = loadJoinedParts('i18n');
  if (fromParts) return fromParts;
  return null;
}

async function main() {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);

  const raw = await loadFullPage();
  const html = scrub(raw);
  writeOut('index.html', html);

  let i18n = loadI18n();
  if (i18n) {
    i18n = i18n
      .replaceAll('"ctaTop": "실행 상담하기"', '"ctaTop": "상담하기"')
      .replaceAll('"heroCTA1": "실행 상담하기"', '"heroCTA1": "상담하기"');
    try {
      const m = i18n.match(/window\.I18N\s*=\s*(\{[\s\S]*\})\s*;?/);
      if (m) {
        const obj = Function('return (' + m[1] + ')')();
        for (const L of Object.keys(obj)) {
          const d = obj[L];
          if (d.pkgs && !d.packages) d.packages = d.pkgs;
          if (!d.targets) d.targets = d.s1_items || [];
          if (!d.target_title) d.target_title = d.pkg_title || '';
          if (!d.strength_title && d.promise) {
            d.strength_title = d.promise[0]?.[0] || '';
            d.strengths = d.promise;
          }
        }
        i18n = 'window.I18N = ' + JSON.stringify(obj) + ';';
      }
    } catch (e) {
      console.warn('[cf-safe-build] i18n compat patch failed', e.message);
    }
    writeOut('i18n.js', i18n);
  } else {
    console.warn('[cf-safe-build] no i18n available');
  }

  writeOut(
    '404.html',
    '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem"><h1>404</h1><p><a href="/">b/a home</a></p></body></html>'
  );

  writeOut(
    '_redirects',
    [
      '# Digital card SPA fallback — new CSV ids without rebuild',
      '# Destination outside /card/ avoids CF infinite-loop (code 100324)',
      '# ?id=:id survives if CF still issues 307 to /card-spa',
      '/card/:id   /card-spa.html?id=:id  200',
      '/card/:id/  /card-spa.html?id=:id  200',
      '',
    ].join('\n')
  );

  console.log(
    '[cf-safe-build] done | EXECUTION=',
    html.includes('EXECUTION'),
    '| footerBrand=',
    html.includes('footerBrand'),
    '| (cards: run build-digital-cards.mjs separately)'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
