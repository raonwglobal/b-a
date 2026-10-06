# Cloudflare Pages — 빌드 무조건 성공 설정

이 저장소는 **정적 사이트**입니다. OpenNext / Workers SSR 을 사용하지 않습니다.

## 왜 예전에 실패했는가

Cloudflare/Wrangler 가 `package.json` 의 `next` 를 보고  
`bunx opennextjs-cloudflare build` 또는 `wrangler deploy` 를 **자동 주입**했습니다.

## 현재 구조 (근본 해결)

| 항목 | 내용 |
|------|------|
| production `package.json` | **next 없음** → OpenNext 자동 감지 차단 |
| `npm run build` | `scripts/cf-safe-build.mjs` — `out/index.html` 존재만 확인 후 **성공** |
| 산출물 | 커밋된 **`out/`** (정적 HTML) |
| API | `functions/api/contact.ts` (Pages Functions) |
| `wrangler.toml` | **없음** (Workers `wrangler deploy` 유도 방지) |

## Cloudflare 대시보드 (필수)

**Settings → Builds & deployments**

| 항목 | 값 |
|------|-----|
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | `out` |
| Deploy / 추가 명령 | **비움** |
| Node.js | 18 또는 20 |

로그에 `opennextjs-cloudflare` / `wrangler deploy` / `OpenNext` 가 **있으면** 위 설정이 아직 잘못된 것입니다.

## 로컬에서 Next 로 수정할 때

```bash
npm run build:next   # next 가 있을 때만, 결과를 out/ 에 반영 후 커밋
```

정적 배포만 필요하면 `out/index.html` 을 직접 수정해도 됩니다.

## GitHub Actions 배포 (선택)

Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`  
워크플로 **Deploy Cloudflare Pages** → `wrangler pages deploy out`
