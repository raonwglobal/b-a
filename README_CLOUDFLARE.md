# Cloudflare Pages 배포

## 이번 오류 해석

```
wrangler deploy on a Pages project
Missing entry-point to Worker script or to assets directory
```

| 로그 | 의미 |
|------|------|
| `wrangler deploy` | **Workers** 배포 명령 |
| Pages project | 이 프로젝트는 **Pages** |
| Missing entry-point | Workers용 `main` 스크립트가 없음 (정상 — 우리는 정적 `out/` 만 씀) |

**원인:** 배포 단계가 `wrangler pages deploy` 또는 Pages 산출물 업로드가 아니라, **`wrangler deploy`** 를 실행함.

저장소에는 `wrangler.toml` 을 두지 않습니다. 있으면 CF/Wrangler 가 Workers 배포 경로로 들어가기 쉽습니다.

---

## 대시보드 필수 설정

**Pages 프로젝트** → Settings → Builds & deployments → **Edit**

| 항목 | 값 |
|------|-----|
| Framework preset | **None** |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Deploy command** | **완전 비움** |
| Node.js | `20` |

### 있으면 삭제

- `wrangler deploy`
- `wrangler pages deploy` (대시보드 Deploy command 에 넣지 말 것 — Pages 가 `out/` 을 직접 올림)
- `bunx opennextjs-cloudflare build`
- `npx @cloudflare/next-on-pages`
- Output = `.next`

저장 후 **Retry deployment**.

빌드 로그만 보면 됩니다:

1. `npm run build` / `next build` 성공
2. `out/` 업로드
3. **`wrangler deploy` 한 줄도 없음**

---

## 권장: Git 자동 빌드 끄고 GitHub Actions 배포

대시보드가 계속 `wrangler deploy` 를 넣으면:

1. Cloudflare → Pages → Settings → Builds → **자동 배포 비활성**
2. GitHub Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
3. Actions **Deploy Cloudflare Pages** → `wrangler pages deploy out` 만 실행

---

## 로컬

```bash
npm install && npm run build
npx wrangler@4 pages deploy out --project-name=YOUR_PAGES_NAME
```

`npx wrangler deploy` 는 사용 금지.
