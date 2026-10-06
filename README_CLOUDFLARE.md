# Cloudflare 배포

**사이트:** https://b-a.bambooasia.biz  
**UI 원본:** https://www.bambooasia.biz (빌드 시 미러)  
**문의:** info@bambooasia.biz

## 빌드

`npm run build` → `scripts/cf-safe-build.mjs`

1. www.bambooasia.biz 정적 UI를 `out/` 에 미러 (원본 디자인 유지)
2. `info@bambooasia.biz (예시)` → `info@bambooasia.biz`
3. 문의 제출 시 `POST /api/contact` 연결

## wrangler

```toml
main = "src/worker.js"
[assets]
directory = "./out"
binding = "ASSETS"
```

## 환경 변수

| 변수 | 값 |
|------|-----|
| `CONTACT_EMAIL` | `info@bambooasia.biz` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | (선택) |
| `RESEND_API_KEY` | (선택) |
| `BA_MIRROR_URL` | 기본 `https://www.bambooasia.biz` |
