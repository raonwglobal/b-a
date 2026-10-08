#!/usr/bin/env node
/**
 * DIGITAL CARDS ONLY — isolated from main site build.
 * Writes solely under out/card/**  (never touches index.html / i18n.js / footer)
 *
 * - Primary template: scripts/digital-card-lite.html (CSV-driven SPA)
 * - /card SPA fallback via main _redirects → /card-spa.html (outside /card/)
 * - Still emits /card/{id}/ for known CSV members (static warm paths)
 * - New sheet rows work after CSV publish via SPA + _redirects (no rebuild required for URL)
 *
 * Usage:
 *   node scripts/build-digital-cards.mjs
 *   npm run build:cards
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outCardDir = join(root, 'out', 'card');
const scriptsDir = join(root, 'scripts');
const DEFAULT_CSV =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vROc_VAnbXFlbCyCAYvO4P0R6fEJgktqkNCrvShvUzgHBCv-10R5kXprgRpQFuYXM29tTXMTWp7eFXz/pub?gid=0&single=true&output=csv';

function statSize(p) {
  try {
    return readFileSync(p).length;
  } catch {
    return 0;
  }
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
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] || '').trim();
    });
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

export async function buildDigitalCards() {
  console.log('[digital-card] isolated card build (no main/footer touch)');
  const template = loadTemplate();
  if (!template) return { ok: false, reason: 'no-template' };

  const csvUrl = process.env.MEMBER_CSV_URL || DEFAULT_CSV;
  let members = [];
  try {
    console.log('[digital-card] fetching members', csvUrl.slice(0, 72) + '…');
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error('CSV HTTP ' + res.status);
    members = parseCsv(await res.text());
    console.log('[digital-card] members', members.map((m) => m.id).join(', ') || '(none)');
  } catch (e) {
    console.warn('[digital-card] CSV fetch failed, fallback', e.message);
    members = [
      {
        id: 'taehoon',
        name_kr: '김태훈',
        name_en: 'Taehoon Kim',
        title_kr: '대표',
        title_en: 'Representative',
        phone: '+84 093 685 0555',
        email: 'kim@bambooasia.biz',
      },
      {
        id: 'magnox',
        name_kr: '정성영',
        name_en: 'Seongyoung Jeong',
        title_kr: '팀장',
        title_en: 'Team Manager',
        phone: '+84 093 896 7541',
        email: 'magnox@bambooasia.biz',
      },
    ];
  }

  if (existsSync(outCardDir)) rmSync(outCardDir, { recursive: true, force: true });
  mkdirSync(outCardDir, { recursive: true });

  const isLite = template.includes('CSV_URL') && template.includes('renderCard');
  if (isLite) {
    const spaRoot = join(root, 'out', 'card-spa.html');
    writeFileSync(spaRoot, template, 'utf8');
    console.log('[digital-card] wrote /card-spa.html (redirect target, outside /card/)');

    writeFileSync(join(outCardDir, 'index.html'), template, 'utf8');
    console.log('[digital-card] wrote /card/index.html (lite SPA — source of truth)');
    for (const m of members) {
      const dir = join(outCardDir, m.id);
      mkdirSync(dir, { recursive: true });
      let pinned = template;
      if (/window\.__CARD_ID__\s*=\s*["']/.test(pinned)) {
        pinned = pinned.replace(
          /window\.__CARD_ID__\s*=\s*["'][^"']*["']\s*;/,
          `window.__CARD_ID__=${JSON.stringify(m.id)};`
        );
      } else {
        pinned = pinned.replace(
          /(const CSV_URL\s*=)/,
          `window.__CARD_ID__=${JSON.stringify(m.id)};\n$1`
        );
      }
      writeFileSync(join(dir, 'index.html'), pinned, 'utf8');
      console.log('[digital-card] wrote /card/' + m.id + '/ (__CARD_ID__=' + m.id + ')');
    }
    return { ok: true, members: members.map((m) => m.id), mode: 'lite-spa' };
  }

  if (!members.length) return { ok: false, reason: 'no-members' };
  writeFileSync(
    join(outCardDir, 'index.html'),
    `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta http-equiv="refresh" content="0;url=/card/${members[0].id}/"/><title>b/a Cards</title></head><body></body></html>`,
    'utf8'
  );
  for (const m of members) {
    const dir = join(outCardDir, m.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), personalize(template, m), 'utf8');
    console.log('[digital-card] wrote /card/' + m.id + '/');
  }
  return { ok: true, members: members.map((m) => m.id), mode: 'artifact' };
}

const isMain = process.argv[1] && process.argv[1].includes('build-digital-cards');
if (isMain) {
  buildDigitalCards()
    .then((r) => {
      console.log('[digital-card] result', r);
      if (!r?.ok) process.exitCode = 1;
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
