#!/usr/bin/env node
/**
 * OpenNext / Workers SSR 경로 차단.
 * Cloudflare 가 bunx opennextjs-cloudflare 를 주입해도
 * 이 가드가 package.json build 앞에 있으면 정적 빌드만 허용.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const bannedFiles = [
  'open-next.config.ts',
  'open-next.config.js',
  'open-next.config.mjs',
  '.open-next',
];
const bannedEnv = [
  'OPEN_NEXT',
  'OPENNEXT',
  'CF_PAGES_OPENNEXT',
];

for (const f of bannedFiles) {
  if (existsSync(join(root, f))) {
    console.error(`[guard] 금지 파일/폴더 발견: ${f}`);
    console.error('[guard] 이 프로젝트는 Cloudflare Pages 정적 export 전용입니다. OpenNext 를 제거하세요.');
    process.exit(1);
  }
}

for (const k of bannedEnv) {
  if (process.env[k]) {
    console.error(`[guard] 금지 환경변수: ${k}`);
    process.exit(1);
  }
}

const cmd = process.env.npm_lifecycle_event || '';
const raw = process.argv.join(' ');
if (/opennext/i.test(raw) || /opennext/i.test(cmd)) {
  console.error('[guard] OpenNext 관련 실행이 감지되었습니다. 중단합니다.');
  process.exit(1);
}

console.log('[guard] OK — static Pages path only (no OpenNext)');
