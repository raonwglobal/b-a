#!/usr/bin/env node
/**
 * Cloudflare Pages 전용 빌드 — 항상 정적 out/ 만 검증.
 * Next.js / OpenNext / wrangler deploy 를 실행하지 않음.
 * CF 가 framework 를 잘못 감지해도 이 스크립트가 build command 이면 성공한다.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outDir = join(root, 'out');
const indexHtml = join(outDir, 'index.html');

console.log('[cf-safe-build] Cloudflare Pages static build (OpenNext disabled)');

if (!existsSync(indexHtml)) {
  console.error('[cf-safe-build] FATAL: out/index.html 없음. 정적 산출물을 커밋하세요.');
  process.exit(1);
}

const banned = ['open-next.config.ts', 'open-next.config.js', 'open-next.config.mjs', '.open-next'];
for (const f of banned) {
  if (existsSync(join(root, f))) {
    console.warn('[cf-safe-build] WARN: OpenNext 잔여 파일 무시:', f);
  }
}

console.log('[cf-safe-build] OK out/index.html present');
console.log('[cf-safe-build] Output directory: out');
process.exit(0);
