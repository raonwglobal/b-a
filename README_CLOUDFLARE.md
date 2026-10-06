# Cloudflare 배포

**사이트:** https://b-a.bambooasia.biz  
**원본 UI 소스:** https://www.bambooasia.biz  
**문의:** info@bambooasia.biz

## 빌드 동작

`npm run build` (`scripts/cf-safe-build.mjs`)가:

1. **www.bambooasia.biz** 전체 정적 UI를 가져와 `out/`에 저장
2. 문의 제출 버튼을 **`POST /api/contact`** 로 연결
3. 연락처/도메인을 `info@bambooasia.biz`, `b-a.bambooasia.biz` 로 정규화

즉 배포 페이지 내용은 bambooasia.biz 와 동일해야 합니다.

## wrangler

```toml
main = "src/worker.js"
[assets]
directory = "./out"
binding = "ASSETS"
```

## 환경 변수

| 변수 | 권장 값 |
|------|--------|
| `CONTACT_EMAIL` | `info@bambooasia.biz` |
| `RESEND_API_KEY` | (선택) |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Apps Script URL |
| `BA_MIRROR_URL` | (선택) 기본 `https://www.bambooasia.biz` |
