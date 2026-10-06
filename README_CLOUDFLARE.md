# b/a - Cloudflare Pages 배포 가이드

## ⚠️ 이 오류가 나면

```
It looks like you've run a Workers-specific command in a Pages project.
For Pages, please run `wrangler pages deploy` instead.
```

**원인:** Pages 프로젝트에 `wrangler deploy`(Workers용)가 실행됨.

**해결:** 아래 대시보드 설정만 사용하세요. `wrangler` / `wrangler deploy` 를 빌드·배포 명령에 넣지 마세요.

---

## 대시보드 설정 (필수)

Cloudflare → **Workers & Pages** → 해당 **Pages** 프로젝트 → **Settings** → **Builds & deployments**

| 항목 | 반드시 이 값 |
|------|----------------|
| Production branch | `main` |
| Framework preset | **Next.js (Static HTML Export)** 또는 **None** |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Root directory** | `/` (비워도 됨) |
| **Deploy command** | **비워 두기** (비우지 말고 wrangler 넣지 말 것) |
| Node.js version | `18` 또는 `20` |

### 확인 사항

1. 프로젝트가 **Pages** 인지 (Workers 아님)
2. Build command에 `wrangler` 단어가 **없음**
3. Advanced / Deploy command 칸이 **비어 있음**
4. 저장 후 **Retry deployment**

`functions/` 폴더는 Pages가 자동으로 `/api/*` Function으로 연결합니다. wrangler.toml 은 사용하지 않습니다.

---

## Git 연결 배포 흐름

```
npm run build   →  out/ 생성
Pages가 out/ 업로드 + functions/ 연결
```

---

## 로컬에서만 CLI로 올릴 때

```bash
npm install
npm run build
npx wrangler@4 pages deploy out --project-name=YOUR_PAGES_PROJECT_NAME
```

`npx wrangler deploy` 는 사용 금지.

---

## 문의 → Google Sheets

1. 시트 1행: `접수시각 | 회사 | 담당자 | 이메일 | 업종 | 투자규모 | 진출지역 | 요청내용`
2. Apps Script: `scripts/google-sheets-apps-script.gs` 배포(웹 앱)
3. Pages → Settings → Variables:
   - `GOOGLE_SHEETS_WEBHOOK_URL` = 웹 앱 URL
   - (선택) `CONTACT_EMAIL`, `RESEND_API_KEY`

---

## 도메인

Pages → Custom domains → `b-a.asia`
