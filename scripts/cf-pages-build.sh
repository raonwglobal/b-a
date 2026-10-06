#!/usr/bin/env bash
# Cloudflare Pages 전용 — OpenNext / wrangler deploy 금지
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== b/a Cloudflare Pages static build ==="
echo "OpenNext / opennextjs-cloudflare / wrangler deploy 는 사용하지 않습니다."

node scripts/guard-no-opennext.mjs

if [ -f package-lock.json ]; then npm ci; else npm install; fi

npm run build

test -f out/index.html || { echo "FAIL: out/index.html missing"; exit 1; }
echo "OK: out/ ready for Pages upload"
