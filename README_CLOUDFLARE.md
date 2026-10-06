# Cloudflare 배포

## Missing entry-point 오류 해결

파이프라인이 `wrangler deploy` 를 실행합니다. 다음이 필요합니다.

```toml
main = "src/worker.js"
[assets]
directory = "./out"
binding = "ASSETS"
```

- `main` → entry-point 충족
- `[assets]` → 정적 out/ 업로드
- `src/worker.js` → `/api/contact` + 정적 파일 서빙

## 환경 변수 (Workers / Pages Settings)

| 변수 | 용도 |
|------|------|
| `GOOGLE_SHEETS_WEBHOOK_URL` | 문의 → Google Sheets |
| `CONTACT_EMAIL` | 수신 메일 |
| `RESEND_API_KEY` | 메일 발송 (선택) |

## Build

`npm run build` → `out/index.html` 확인만 (항상 성공)
