#!/usr/bin/env node
/**
 * b-a static build
 * Loads scripts/full-page.html (or chunks) and injects zip-faithful footer.
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const root = process.cwd();
const outDir = join(root, 'out');
const FULL = join(root, 'scripts', 'full-page.html');
const I18N = join(root, 'scripts', 'i18n.js');

const ZIP_FOOTER = `
<footer class="site-footer">
  <div class="wrap footer-top">
    <div class="footer-brand">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="logo-box">b/a</div>
        <span style="font-size:13px;font-weight:600">베트남 사업 실행 플랫폼</span>
      </div>
      <p style="margin-top:12px;font-size:12.5px;line-height:1.6;color:#667085;max-width:36ch">시장조사부터 법인설립, 거래, 현지화, 운영까지. 빠르고 안전한 베트남 사업 진입을 위한 실행 플랫폼.</p>
      <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
        <span class="ftag">PMO</span>
        <span class="ftag">VDR</span>
        <span class="ftag">Compliance</span>
      </div>
    </div>
    <div class="footer-cols">
      <div>
        <div class="fcol-title">서비스</div>
        <div class="fcol-list">
          <a href="#svc">진출 실행지원</a>
          <a href="#svc">거래·M&A</a>
          <a href="#svc">산업별 현지화</a>
          <a href="#svc">보안·준법</a>
          <a href="#svc">운영지원</a>
        </div>
      </div>
      <div>
        <div class="fcol-title">플랫폼</div>
        <div class="fcol-list">
          <a href="#process">이용 절차</a>
          <a href="#plans">서비스 상품</a>
          <a href="#svc">검증 원칙</a>
          <a href="#svc">보안 정책</a>
        </div>
      </div>
      <div>
        <div class="fcol-title">Contact</div>
        <div class="fcol-list">
          <a href="#inquiry">실행 상담하기</a>
          <a href="mailto:info@bambooasia.biz">info@bambooasia.biz</a>
          <span>Vietnam · Korea</span>
        </div>
      </div>
    </div>
  </div>
  <div class="wrap footer-bot">
    <span>© <span id="year"></span> b/a — Vietnam Business Execution Platform. All rights reserved.</span>
    <span class="footer-mono">Built as secure execution platform · Not a consulting brochure</span>
  </div>
</footer>`;

const ZIP_FOOTER_CSS = `
.site-footer{background:#fff;border-top:1px solid rgba(0,0,0,.05)}
.footer-top{padding:40px 0;display:flex;flex-direction:column;gap:32px}
@media(min-width:1024px){.footer-top{flex-direction:row;justify-content:space-between;align-items:flex-start}}
.ftag{font-size:10px;padding:4px 8px;border-radius:999px;background:#F3F4F6;border:1px solid rgba(0,0,0,.05);font-weight:500}
.footer-cols{display:grid;grid-template-columns:1fr 1fr;gap:32px;font-size:12.5px}
@media(min-width:640px){.footer-cols{grid-template-columns:repeat(3,1fr)}}
.fcol-title{font-weight:700;color:#101828}
.fcol-list{margin-top:12px;display:flex;flex-direction:column;gap:8px;color:#667085}
.fcol-list a:hover{color:#101828}
.footer-bot{height:48px;border-top:1px solid rgba(0,0,0,.05);display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#98A2B3;gap:12px}
.footer-mono{display:none;font-family:ui-monospace,monospace}
@media(min-width:640px){.footer-mono{display:block}}
`;

console.log('[cf-safe-build] consulting UI');

function ensureDir(p) { mkdirSync(p, { recursive: true }); }
function writeOut(rel, content) {
  const p = join(outDir, rel);
  ensureDir(dirname(p));
  writeFileSync(p, content, 'utf8');
  console.log('[cf-safe-build] wrote', rel, `(${Buffer.byteLength(content)}b)`);
}
function scrub(text) {
  return text
    .replaceAll('info@bambooasia.biz (예시)', 'info@bambooasia.biz')
    .replaceAll('hello@b-a.kr (예시)', 'info@bambooasia.biz')
    .replaceAll('hello@b-a.kr', 'info@bambooasia.biz')
    .replaceAll('contact@b-a.asia', 'info@bambooasia.biz');
}
function applyZipFooter(html) {
  let out = html;
  if (!out.includes('footer-cols') && out.includes('</style>')) {
    out = out.replace('</style>', ZIP_FOOTER_CSS + '\n</style>');
  }
  if (out.includes('<footer')) {
    out = out.replace(/<footer[\s\S]*?<\/footer>/, ZIP_FOOTER);
  } else {
    out = out.replace('</body>', ZIP_FOOTER + '\n</body>');
  }
  // ensure year script still works
  if (!out.includes("getElementById('year')") && !out.includes('getElementById("year")')) {
    out = out.replace('</body>', "<script>var y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();</script>\n</body>");
  }
  return out;
}
function loadFullPage() {
  const dir = join(root, 'scripts');
  if (existsSync(dir)) {
    const chunks = readdirSync(dir)
      .filter((f) => /^full-page\.chunk\d+\.txt$/.test(f))
      .sort((a, b) => Number(a.match(/chunk(\d+)/)[1]) - Number(b.match(/chunk(\d+)/)[1]));
    if (chunks.length >= 2) {
      console.log('[cf-safe-build] loading', chunks.length, 'chunks');
      return chunks.map((f) => readFileSync(join(dir, f), 'utf8')).join('');
    }
  }
  if (existsSync(FULL)) {
    console.log('[cf-safe-build] loading full-page.html');
    return readFileSync(FULL, 'utf8');
  }
  return null;
}

async function main() {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);
  const raw = loadFullPage();
  if (!raw) {
    console.error('[cf-safe-build] FATAL: no full-page source');
    process.exit(1);
  }
  const html = applyZipFooter(scrub(raw));
  writeOut('index.html', html);
  if (existsSync(I18N)) writeOut('i18n.js', readFileSync(I18N, 'utf8'));
  writeOut('404.html', '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem"><h1>404</h1><p><a href="/">b/a home</a></p></body></html>');
  console.log('[cf-safe-build] done — footer has site-footer/footer-cols:', html.includes('site-footer') && html.includes('footer-cols'));
}
main().catch((e) => { console.error(e); process.exit(1); });
