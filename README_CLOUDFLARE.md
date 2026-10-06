# b/a — Cloudflare Pages 배포

## GitHub Actions 빌드 테스트 (우선)

리포에 **Build (static export)** 워크플로가 있습니다.

- 경로: `.github/workflows/build.yml`
- 동작: `npm run build` → `out/` 생성 여부만 검증 (**wrangler 사용 안 함**)
- 확인: GitHub → **Actions** 탭 → 최신 실행 결과

로컬에서 동일 검증:

```bash
npm install
npm run build
ls out/index.html   # 있어야 함
```

이 빌드가 성공하면 **앱 코드/Next 설정은 정상**입니다.  
Cloudflare 오류는 **배포 설정(wrangler deploy)** 문제일 가능성이 큽니다.

---

## Cloudflare 반복 오류의 근본 원인

로그에 이런 메시지가 있으면:

```
wrangler deploy on a Pages project
Missing entry-point to Worker script
```

**Build/Deploy 명령에 `wrangler deploy`가 들어가 있거나**,  
플랫폼이 Workers 경로로 실행 중인 상태입니다.

이 프로젝트는:

| 올바른 것 | 잘못된 것 |
|-----------|----------|
| `npm run build` | `wrangler deploy` |
| 산출물 `out/` | 산출물 `.next` |
| **Pages** | **Workers** |
| `functions/` API | Worker `main` entry |

### 대시보드 필수 값

**Pages** 프로젝트 → Settings → Builds & deployments

| 항목 | 값 |
|------|-----|
| Framework preset | **None** 또는 Next.js (Static HTML Export) |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Deploy command** | **완전 비움** |
| Node | 18 또는 20 |

`wrangler.toml` 은 리포에서 제거했습니다. (있으면 CF가 `wrangler deploy`를 시도하는 경우가 있음)

---

## 문의 → Google Sheets

Variables: `GOOGLE_SHEETS_WEBHOOK_URL`  
스크립트: `scripts/google-sheets-apps-script.gs`
