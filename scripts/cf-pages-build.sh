#!/usr/bin/env bash
# Cloudflare Pages 전용 빌드 — OpenNext / Workers SSR 경로 배제
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[cf-pages-build] Next.js static export only (output: export → out/)"
echo "[cf-pages-build] OpenNext / opennextjs-cloudflare / next-on-pages 는 사용하지 않습니다."

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

npm run build

if [ ! -f out/index.html ]; then
  echo "[cf-pages-build] ERROR: out/index.html 없음 — static export 실패"
  exit 1
fi

echo "[cf-pages-build] OK: out/ ready"
ls -la out | head -20
