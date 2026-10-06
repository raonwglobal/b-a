# b/a — Cloudflare 배포 (근본 원인과 해결)

## 근본 원인

Cloudflare / Wrangler **auto-config** 가 `package.json` 의 Next.js 를 보면 강제로:

```bash
bunx opennextjs-cloudflare build
```

를 실행합니다. (로그: `OpenNext — Cloudflare build`, `runAutoConfig`)

| OpenNext 경로 | 이 프로젝트 (실제) |
|---------------|-------------------|
| SSR / Workers 번들 | `output: 'export'` **정적 HTML** |
| 산출물 `.next` 기반 | 산출물 **`out/`** |
| Next 지원 정책 검사 (14.x 거부) | GitHub Actions 에서 `next build` **성공** |
| `wrangler deploy` | **`wrangler pages deploy out`** |

대시보드 Framework 만 바꿔도 auto-config 가 다시 OpenNext 를 호출하면 동일 오류가 반복됩니다.

## 해결 (권장)

**빌드·배포 = GitHub Actions / Cloudflare Git 자동 빌드 = 끄기**

1. Cloudflare → Pages 프로젝트 → **Settings → Builds**
   - Git 자동 배포 **Disable** 또는 OpenNext/`wrangler deploy` 빌드 구성 제거
2. GitHub → **Settings → Secrets and variables → Actions**:
   - `CLOUDFLARE_API_TOKEN` — Account → Cloudflare Pages → Edit
   - `CLOUDFLARE_ACCOUNT_ID`
   - (선택) `CLOUDFLARE_PAGES_PROJECT` (기본 `b-a`)
3. `main` 푸시 → 워크플로 **Deploy Cloudflare Pages**:
   - `npm run build` → `out/`
   - `wrangler pages deploy out` (OpenNext 없음)

파일: `.github/workflows/deploy-pages.yml`

## 로컬 배포

```bash
npm install && npm run build
npx wrangler@4 pages deploy out --project-name=b-a
```

## Google Sheets

Variables: `GOOGLE_SHEETS_WEBHOOK_URL`  
스크립트: `scripts/google-sheets-apps-script.gs`
