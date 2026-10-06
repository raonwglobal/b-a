# Cloudflare Pages — OpenNext 완전 배제

## 왜 리포에서 지워도 OpenNext가 다시 뜨는가

OpenNext는 이 저장소에 없습니다.
Cloudflare/Wrangler가 `next` 패키지를 감지하면 **auto-config**로
`bunx opennextjs-cloudflare build` 또는 `wrangler deploy`를 **플랫폼이 주입**합니다.

## 완전 배제 (필수)

### 1) Cloudflare 자동 빌드 끄기

Dashboard → Pages 프로젝트 → **Settings → Builds**

- Production **자동 배포 비활성** (권장)
- 또는 Build command 를 오직 `npm run build`, Output `out`, Framework **None**
- `opennextjs-cloudflare` / `wrangler deploy` 문자열 **전부 삭제**

### 2) GitHub Actions 로만 배포

Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`  
워크플로 **Deploy Cloudflare Pages** → `pages deploy out` 만 실행

## 저장소 보호

- `scripts/guard-no-opennext.mjs` + `prebuild`
- `wrangler.toml` → `pages_build_output_dir = "out"` only
- `npm run deploy` → 실패 (pages deploy 안내)
