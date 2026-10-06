# Cloudflare Pages — static only (no Next.js / OpenNext)

## 이번 오류 원인

```
Framework: Next.js
Build Command: npx next build
Unable to detect the version of the `next` package
```

Wrangler **auto-config** 가 `next.config.js` / `app/` 을 보고 Next.js 로 오인했습니다.
해당 파일은 모두 제거했습니다. 배포 소스는 **`out/` 정적 HTML** 만 사용합니다.

## 저장소 구조

| 경로 | 역할 |
|------|------|
| `out/` | 배포 산출물 (index.html) |
| `functions/api/contact.ts` | 문의 API |
| `npm run build` | `out/index.html` 존재 확인 후 성공 |
| `wrangler.toml` | `pages_build_output_dir = "out"` 만 |

## 대시보드 필수 설정

**Workers & Pages → Pages 프로젝트** (Workers 앱 아님)

| 항목 | 값 |
|------|-----|
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | `/` |
| Deploy command | **비움** |

로그에 `Framework: Next.js` / `npx next build` / `OpenNext` 가 있으면 설정이 아직 잘못되었습니다.

## 확인

성공 로그 예:

```
[cf-safe-build] OK out/index.html present
```
