# b/a — Cloudflare Pages 배포 (정적 Next.js)

## 근본 구조

이 프로젝트는 **Next.js Static Export** 입니다.

| 항목 | 값 |
|------|-----|
| `next.config.js` | `output: 'export'` |
| 빌드 결과물 | **`out/`** (`.next` 아님) |
| API | `functions/api/*` (Pages Functions) |
| SSR / next-on-pages | **사용하지 않음** |

Cloudflare가 아래처럼 감지하면 **잘못된 경로**입니다.

```
Framework: Next.js
Output Directory: .next    ← 잘못됨
Worker Name: b-a           ← Workers SSR 경로
```

올바르면:

```
Framework: None 또는 Next.js (Static HTML Export)
Output Directory: out
Build command: npm run build   (또는 bun run build)
```

---

## 대시보드 설정 (필수)

**Workers & Pages → Pages 프로젝트 → Settings → Builds & deployments**

| 항목 | 올바른 값 |
|------|-----------|
| Framework preset | **Next.js (Static HTML Export)** 또는 **None** |
| Build command | `npm run build` 또는 `bun run build` |
| **Build output directory** | **`out`** ← `.next` 로 두면 실패 |
| Root directory | `/` |
| Deploy command | **비움** |
| Node.js version | 18 또는 20 |

저장 후 **Retry deployment**.

### 자주 나는 오류

1. **`Next.js ... cannot be automatically configured` / `14.2.35`**
   - SSR 자동 설정 경로로 들어간 경우. Next는 14.2.35+ 로 맞춤.
   - 그래도 Framework/Output 이 `.next` 이면 위 표대로 **out** 으로 수동 변경.

2. **`Workers-specific command in a Pages project`**
   - Deploy command 에 `wrangler deploy` 가 있음 → 삭제.
   - 로컬 CLI 는 `npx wrangler pages deploy out` 만 사용.

3. **`Missing entry-point to Worker script`**
   - Workers 로 만든 프로젝트 → **Pages** 로 새로 연결.

---

## 문의 → Google Sheets

1. 시트 헤더: `접수시각 | 회사 | 담당자 | 이메일 | 업종 | 투자규모 | 진출지역 | 요청내용`
2. `scripts/google-sheets-apps-script.gs` 웹 앱 배포
3. Pages Variables: `GOOGLE_SHEETS_WEBHOOK_URL`

---

## 로컬 빌드 확인

```bash
npm install
npm run build
ls out    # index.html 등이 있어야 함
```
