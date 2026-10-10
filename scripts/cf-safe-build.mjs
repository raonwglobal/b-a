#!/usr/bin/env node
/**
 * MAIN SITE ONLY static build.
 * Enhanced footer: hours, office, disclaimer, sections, related domain, © brand
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

const FOOTER_I18N = {
  KR: {
    footer: '[ b/a ] 컨설팅 그룹',
    footer_entity: '[ b/a ] 컨설팅 그룹',
    footer_rep: '대표 김태훈',
    footer_hours: '운영시간: 월–금 09:00–18:00 (ICT)',
    footer_disclaimer: '본 사이트는 소개 및 문의 접수 창구이며, 직접적인 정보 제공·가이드·자문을 하지 않습니다.',
    footer_office_title: '사업장',
    footer_nav_title: '바로가기',
    footer_legal_title: '약관',
    footer_related_title: '관련 사이트',
    footer_privacy: '개인정보처리방침',
    footer_terms: '이용약관',
    footer_nav_svc: '서비스',
    footer_nav_process: '절차',
    footer_nav_inquiry: '문의',
    footer_built: '',
  },
  EN: {
    footer: '[ b/a ] Consulting Group',
    footer_entity: '[ b/a ] Consulting Group',
    footer_rep: 'Representative: Taehoon Kim',
    footer_hours: 'Hours: Mon–Fri 09:00–18:00 (ICT)',
    footer_disclaimer: 'This site is for introduction and inquiry intake only. It does not provide direct information, guidance, or professional advice.',
    footer_office_title: 'Office',
    footer_nav_title: 'Explore',
    footer_legal_title: 'Legal',
    footer_related_title: 'Related',
    footer_privacy: 'Privacy Policy',
    footer_terms: 'Terms of Use',
    footer_nav_svc: 'Services',
    footer_nav_process: 'Process',
    footer_nav_inquiry: 'Contact',
    footer_built: '',
  },
  VI: {
    footer: '[ b/a ] Consulting Group',
    footer_entity: '[ b/a ] Consulting Group',
    footer_rep: 'Đại diện: Taehoon Kim',
    footer_hours: 'Giờ làm việc: T2–T6 09:00–18:00 (ICT)',
    footer_disclaimer: 'Trang này chỉ để giới thiệu và tiếp nhận liên hệ. Không cung cấp thông tin, hướng dẫn hoặc tư vấn trực tiếp.',
    footer_office_title: 'Văn phòng',
    footer_nav_title: 'Liên kết',
    footer_legal_title: 'Pháp lý',
    footer_related_title: 'Liên quan',
    footer_privacy: 'Chính sách bảo mật',
    footer_terms: 'Điều khoản sử dụng',
    footer_nav_svc: 'Dịch vụ',
    footer_nav_process: 'Quy trình',
    footer_nav_inquiry: 'Liên hệ',
    footer_built: '',
  },
  JP: {
    footer: '[ b/a ] コンサルティンググループ',
    footer_entity: '[ b/a ] コンサルティンググループ',
    footer_rep: '代表 金泰勲',
    footer_hours: '営業時間: 月–金 09:00–18:00 (ICT)',
    footer_disclaimer: '本サイトは紹介およびお問い合わせ受付の窓口であり、直接的な情報提供・ガイド・助言は行いません。',
    footer_office_title: '事業所',
    footer_nav_title: 'リンク',
    footer_legal_title: '規約',
    footer_related_title: '関連サイト',
    footer_privacy: 'プライバシーポリシー',
    footer_terms: '利用規約',
    footer_nav_svc: 'サービス',
    footer_nav_process: '手順',
    footer_nav_inquiry: 'お問い合わせ',
    footer_built: '',
  },
};

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
  if (!out.includes('name="privacy_agree"') && out.includes('id="submitBtn"')) {
    out = out.replace(
      '<button type="submit" class="btn-cta" id="submitBtn"',
      '<div class="consent-row"><input type="checkbox" name="privacy_agree" id="privacy_agree" required/><label for="privacy_agree">문의 처리 및 회신을 위한 <a href="/privacy" target="_blank" rel="noopener">개인정보 수집·이용</a>에 동의합니다. <span class="req">(필수)</span></label></div>\n<button type="submit" class="btn-cta" id="submitBtn"'
    );
  }
  if (out.includes('privacy_agree') && !out.includes('.consent-row{')) {
    out = out.replace(
      '</style>',
      'input[type="checkbox"]{width:auto!important;height:auto!important;min-width:16px;min-height:16px;margin:.15rem 0 0!important;padding:0!important;flex-shrink:0;accent-color:#16A34A;border-radius:3px;cursor:pointer}.consent-row{display:flex;align-items:flex-start;gap:.65rem;margin:.15rem 0 1.1rem;font-size:12.5px;color:#667085;line-height:1.5;width:100%;box-sizing:border-box}.consent-row label{display:block!important;margin:0!important;padding:0!important;font-weight:400!important;font-size:12.5px!important;color:#667085!important;line-height:1.5;cursor:pointer;flex:1;min-width:0}.consent-row a{color:#16A34A;text-decoration:underline;text-underline-offset:2px}.consent-row .req{color:#16A34A;font-weight:600}</style>'
    );
  }
  if (out.includes('name="privacy_agree"') && out.includes('display:flex;align-items:flex-start') && !out.includes('class="consent-row"')) {
    const leg = out.match(/<label style="display:flex;align-items:flex-start[\s\S]*?<\/label>/);
    if (leg) {
      out = out.replace(leg[0], '<div class="consent-row"><input type="checkbox" name="privacy_agree" id="privacy_agree" required/><label for="privacy_agree">문의 처리 및 회신을 위한 <a href="/privacy" target="_blank" rel="noopener">개인정보 수집·이용</a>에 동의합니다. <span class="req">(필수)</span></label></div>');
    }
  }

  const NEW_FOOTER = `<footer>
<div class="wrap footer-inner">
  <div class="footer-grid">
    <div class="footer-col">
      <a class="footer-brand" href="/"><div class="logo-box">b/a</div><span id="footerBrand">베트남 사업 실행 플랫폼</span></a>
      <p id="footerDesc" class="footer-desc">시장조사부터 법인설립, 거래, 현지화, 운영까지. 베트남 사업 진출을 위한 실행 플랫폼.</p>
      <p id="footerDisclaimer" class="footer-note">본 사이트는 소개 및 문의 접수 창구이며, 직접적인 정보 제공·가이드·자문을 하지 않습니다.</p>
    </div>
    <div class="footer-col">
      <div class="footer-h" id="footerOfficeTitle">사업장</div>
      <p class="footer-line" id="footerEntity">[ b/a ] 컨설팅 그룹</p>
      <p class="footer-line" id="footerRep">대표 김태훈</p>
      <p class="footer-line"><a id="footerAddr" class="footer-link" href="https://www.google.com/maps/search/?api=1&query=GoldenKing+Room+1104+Ho+Chi+Minh+City+Vietnam" target="_blank" rel="noopener">Room 1104 GoldenKing</a></p>
      <p class="footer-line" id="footerCity">Ho Chi Minh City · Vietnam</p>
      <p class="footer-line" id="footerHours">운영시간: 월–금 09:00–18:00 (ICT)</p>
      <p class="footer-line"><a id="footerEmail" href="mailto:info@bambooasia.biz">info@bambooasia.biz</a></p>
      <p class="footer-line"><a id="footerHost" class="footer-link" href="/">b-a.bambooasia.biz</a></p>
    </div>
    <div class="footer-col">
      <div class="footer-h" id="footerNavTitle">바로가기</div>
      <nav class="footer-nav">
        <a href="#svc-a" id="footerNavSvc">서비스</a>
        <a href="#process" id="footerNavProcess">절차</a>
        <a href="#inquiry" id="footerNavInquiry">문의</a>
      </nav>
      <div class="footer-h" id="footerLegalTitle">약관</div>
      <nav class="footer-nav">
        <a href="/privacy" id="footerPrivacy">개인정보처리방침</a>
        <a href="/terms" id="footerTerms">이용약관</a>
      </nav>
      <div class="footer-h" id="footerRelatedTitle">관련 사이트</div>
      <nav class="footer-nav">
        <a href="https://www.bambooasia.biz" target="_blank" rel="noopener" id="footerRelated">bambooasia.biz</a>
      </nav>
    </div>
  </div>
  <div class="f-bot">
    <span>© <span id="year"></span> <span id="footerCopy">[ b/a ] 컨설팅 그룹</span></span>
  </div>
</div>
</footer>`;

  const FOOTER_CSS = `footer{background:#fff;border-top:1px solid rgba(0,0,0,.06);padding:2.25rem 0 1.5rem}.footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:1.75rem 2rem}.footer-brand{display:inline-flex;align-items:center;gap:.65rem;text-decoration:none;color:inherit}.footer-brand span{font-size:13px;font-weight:600}.footer-desc{margin:.75rem 0 0;font-size:12.5px;color:#667085;max-width:42ch;line-height:1.55}.footer-note{margin:.65rem 0 0;font-size:11.5px;color:#98A2B3;max-width:42ch;line-height:1.5}.footer-h{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#98A2B3;margin:0 0 .55rem}.footer-col .footer-h:not(:first-child){margin-top:1.1rem}.footer-line{margin:0 0 .35rem;font-size:12.5px;color:#475467;line-height:1.45}.footer-link,.footer-line a{color:#16A34A;text-decoration:none;font-weight:500}.footer-link:hover,.footer-line a:hover{text-decoration:underline}.footer-nav{display:flex;flex-direction:column;gap:.4rem}.footer-nav a{font-size:12.5px;color:#475467;text-decoration:none}.footer-nav a:hover{color:#16A34A}.f-bot{margin-top:1.5rem;padding-top:1rem;border-top:1px solid rgba(0,0,0,.05);font-size:11px;color:#98A2B3;display:flex;justify-content:flex-start;gap:1rem;flex-wrap:wrap}@media (max-width:860px){.footer-grid{grid-template-columns:1fr 1fr}}@media (max-width:560px){.footer-grid{grid-template-columns:1fr}}`;

  if (out.includes('<footer')) {
    out = out.replace(/<footer[\s\S]*?<\/footer>/, NEW_FOOTER);
  }
  if (out.includes('footer-grid') && !out.includes('.footer-grid{')) {
    out = out.replace('</style>', FOOTER_CSS + '</style>');
  }
  if (out.includes('footerDisclaimer') && !out.includes("setText('footerDisclaimer'")) {
    out = out.replace(
      "setText('footerBuilt',t.footer_built||'Built as secure execution platform');",
      "setText('footerCopy',t.footer||'[ b/a ] 컨설팅 그룹');\n setText('footerDisclaimer',t.footer_disclaimer||'');\n setText('footerHours',t.footer_hours||'');\n setText('footerOfficeTitle',t.footer_office_title||'');\n setText('footerNavTitle',t.footer_nav_title||'');\n setText('footerLegalTitle',t.footer_legal_title||'');\n setText('footerRelatedTitle',t.footer_related_title||'');\n setText('footerPrivacy',t.footer_privacy||'');\n setText('footerTerms',t.footer_terms||'');\n setText('footerNavSvc',t.footer_nav_svc||'');\n setText('footerNavProcess',t.footer_nav_process||'');\n setText('footerNavInquiry',t.footer_nav_inquiry||'');\n setText('footerRep',t.footer_rep||'');\n setText('footerEntity',t.footer_entity||'[ b/a ] 컨설팅 그룹');"
    );
  }
  out = out.replace(
    "setText('footerCopy',t.footer||'b/a — Vietnam Business Execution Platform');",
    "setText('footerCopy',t.footer||'[ b/a ] 컨설팅 그룹');"
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
          if (FOOTER_I18N[L]) Object.assign(d, FOOTER_I18N[L]);
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

  writeOut('404.html', '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem"><h1>404</h1><p><a href="/">b/a home</a></p></body></html>');
  writeOut('_redirects', ['# Old path /card/{id}/ → query form', '/card/:id   /card/?id=:id  302', '/card/:id/  /card/?id=:id  302', ''].join('\n'));

  for (const name of ['privacy.html', 'terms.html']) {
    const src = join(scriptsDir, name);
    if (existsSync(src)) writeOut(name, readFileSync(src, 'utf8'));
    else console.warn('[cf-safe-build] missing', name);
  }

  console.log('[cf-safe-build] done | footer=', html.includes('footer-grid'), '| privacy=', html.includes('href="/privacy"'));
}

main().catch((e) => { console.error(e); process.exit(1); });
