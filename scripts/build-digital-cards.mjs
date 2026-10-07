#!/usr/bin/env node
/**
 * Build digital business cards at /card/ and /card/{id}/
 * Primary: scripts/digital-card-lite.html (CSV-driven SPA)
 * Optional: digital-card.partNN.b64 full React artifact
 * Not linked from main site navigation
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outDir = join(root, 'out', 'card');
const scriptsDir = join(root, 'scripts');
const DEFAULT_CSV =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vROc_VAnbXFlbCyCAYvO4P0R6fEJgktqkNCrvShvUzgHBCv-10R5kXprgRpQFuYXM29tTXMTWp7eFXz/pub?gid=0&single=true&output=csv';
const SITE = 'https://b-a.bambooasia.biz';
const SITE_HOST = 'b-a.bambooasia.biz';

function statSize(p) {
  try { return readFileSync(p).length; } catch { return 0; }
}

function loadTemplate() {
  const lite = join(scriptsDir, 'digital-card-lite.html');
  if (existsSync(lite) && statSize(lite) > 2000) {
    console.log('[digital-card] template: digital-card-lite.html');
    return readFileSync(lite, 'utf8');
  }
  const plain = join(scriptsDir, 'digital-card.template.html');
  if (existsSync(plain) && statSize(plain) > 10000) {
    console.log('[digital-card] template: digital-card.template.html');
    return readFileSync(plain, 'utf8');
  }
  const parts = readdirSync(scriptsDir)
    .filter((f) => /^digital-card\.part\d+\.b64$/.test(f))
    .sort();
  if (!parts.length) {
    console.warn('[digital-card] no template found — skip');
    return null;
  }
  const b64 = parts.map((f) => readFileSync(join(scriptsDir, f), 'utf8')).join('').replace(/\s+/g, '');
  const html = gunzipSync(Buffer.from(b64, 'base64')).toString('utf8');
  console.log('[digital-card] template from', parts.length, 'parts,', html.length, 'bytes');
  return html;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(',');
    const row = {};
    headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });
    if (row.id) rows.push(row);
  }
  return rows;
}

function phoneDigits(phone) {
  const d = String(phone || '').replace(/[^\d+]/g, '');
  if (d.startsWith('+')) return d;
  if (d.startsWith('84')) return '+' + d;
  return d;
}

function personalize(template, m) {
  const roleLine = m.title_en
    ? `${m.title_en} / 베트남 사업 실행 플랫폼`
    : m.title_kr
      ? `${m.title_kr} / 베트남 사업 실행 플랫폼`
      : 'Representative / 베트남 사업 실행 플랫폼';
  const phone = m.phone || '+84 093 685 0555';
  const digits = phoneDigits(phone);
  const email = m.email || 'info@bambooasia.biz';
  const nameKr = m.name_kr || m.name_en || m.id;
  const nameEn = m.name_en || m.name_kr || m.id;
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>b/a Digital Card · ${nameKr} · Bamboo Asia</title>`);
  html = html.replaceAll('김태훈', nameKr);
  html = html.replaceAll('Taehoon Kim', nameEn);
  html = html.replaceAll('Representative / 베트남 사업 실행 플랫폼', roleLine);
  html = html.replaceAll('+84 093 685 0555', phone);
  html = html.replaceAll('+84936850555', digits);
  html = html.replaceAll('kim@bambooasia.biz', email);
  return html;
}

function memberIndexHtml(members) {
  const cards = members.map((m) => `
    <a class="card" href="/card/${m.id}/">
      <div class="logo">b/a</div>
      <div class="meta">
        <div class="name">${String(m.name_kr || m.name_en).replace(/</g,'&lt;')}</div>
        <div class="en">${String(m.name_en || '').replace(/</g,'&lt;')}</div>
        <div class="role">${String(m.title_kr || m.title_en || '').replace(/</g,'&lt;')}</div>
      </div>
      <div class="arrow">→</div>
    </a>`).join('\n');
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>b/a Digital Cards</title><meta name="robots" content="noindex"/>
<style>
body{margin:0;min-height:100vh;font-family:system-ui,sans-serif;background:#0C1611;color:#F9F5EB;display:flex;flex-direction:column;align-items:center;padding:2rem 1.25rem}
.card{display:flex;align-items:center;gap:1rem;padding:1rem;border-radius:16px;background:rgba(249,245,235,.06);border:1px solid rgba(249,245,235,.12);color:inherit;text-decoration:none;width:100%;max-width:420px;margin-bottom:.75rem}
.logo{width:40px;height:40px;border-radius:10px;background:#F9F5EB;color:#0C1611;display:flex;align-items:center;justify-content:center;font-weight:700}
</style></head><body><h1 style="font-size:1rem;letter-spacing:.12em;text-transform:uppercase;opacity:.7">Digital Cards</h1>
${cards}<p style="opacity:.35;font-size:11px;margin-top:2rem"><a href="/" style="color:#C2A77A">b/a home</a></p></body></html>`;
}

export async function buildDigitalCards() {
  const template = loadTemplate();
  if (!template) return { ok: false, reason: 'no-template' };

  const csvUrl = process.env.MEMBER_CSV_URL || DEFAULT_CSV;
  let members = [];
  try {
    console.log('[digital-card] fetching members', csvUrl.slice(0, 72) + '…');
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error('CSV HTTP ' + res.status);
    members = parseCsv(await res.text());
    console.log('[digital-card] members', members.map((m) => m.id).join(', '));
  } catch (e) {
    console.warn('[digital-card] CSV fetch failed, fallback', e.message);
    members = [
      { id: 'taehoon', name_kr: '김태훈', name_en: 'Taehoon Kim', title_kr: '대표', title_en: 'Representative', phone: '+84 093 685 0555', email: 'kim@bambooasia.biz' },
      { id: 'magnox', name_kr: '정성영', name_en: 'Seongyoung Jeong', title_kr: '팀장', title_en: 'Team Manager', phone: '+84 093 896 7541', email: 'magnox@bambooasia.biz' },
    ];
  }
  if (!members.length) return { ok: false, reason: 'no-members' };

  mkdirSync(outDir, { recursive: true });
  const isLite = template.includes('CSV_URL') && template.includes('renderCard');
  if (isLite) {
    writeFileSync(join(outDir, 'index.html'), template, 'utf8');
    console.log('[digital-card] wrote /card/index.html (lite SPA)');
    for (const m of members) {
      const dir = join(outDir, m.id);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'index.html'), template, 'utf8');
      console.log('[digital-card] wrote /card/' + m.id + '/');
    }
    return { ok: true, members: members.map((m) => m.id), mode: 'lite' };
  }

  writeFileSync(join(outDir, 'index.html'), memberIndexHtml(members), 'utf8');
  for (const m of members) {
    const dir = join(outDir, m.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), personalize(template, m), 'utf8');
    console.log('[digital-card] wrote /card/' + m.id + '/');
  }
  return { ok: true, members: members.map((m) => m.id), mode: 'artifact' };
}

const isMain = process.argv[1] && process.argv[1].includes('build-digital-cards');
if (isMain) {
  buildDigitalCards()
    .then((r) => { if (!r?.ok) process.exitCode = 1; })
    .catch((e) => { console.error(e); process.exit(1); });
}
