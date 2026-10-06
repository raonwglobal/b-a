# Cloudflare 배포

**사이트:** https://b-a.bambooasia.biz  
**문의 수신(기본):** info@bambooasia.biz

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

| 변수 | 용도 | 권장 값 |
|------|------|--------|
| `GOOGLE_SHEETS_WEBHOOK_URL` | 문의 → Google Sheets | Apps Script 웹앱 URL |
| `CONTACT_EMAIL` | 문의 수신 메일 | `info@bambooasia.biz` |
| `RESEND_API_KEY` | 메일 발송 (선택) | Resend API 키 |

`CONTACT_EMAIL` 미설정 시 기본값은 **info@bambooasia.biz** 입니다.  
Resend 발신 주소: `noreply@bambooasia.biz` (도메인 `bambooasia.biz` 를 Resend에 인증해야 합니다).

## 커스텀 도메인

Cloudflare → 프로젝트 → Custom domains → **b-a.bambooasia.biz** 연결

## Build

`npm run build` → `out/index.html` 확인만 (항상 성공)
