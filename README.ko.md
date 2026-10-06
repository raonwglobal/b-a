# b/a — 베트남 사업 실행 플랫폼

**Vietnam Business Execution Platform**

법인설립 · 거래·M&A · 산업별 현지화 · 보안·준법 · 현지 운영을 하나의 파트너와 함께 수행하는 실행형 컨설팅 플랫폼입니다.

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **서비스명** | b/a |
| **웹사이트** | [https://b-a.bambooasia.biz](https://b-a.bambooasia.biz) |
| **문의** | info@bambooasia.biz |
| **포지션** | Vietnam Business Execution Platform |
| **배포** | Cloudflare (정적 `out/` + Worker `/api/contact`) |
| **지원 언어** | 한국어 · English · Tiếng Việt · 日本語 |
| **라이선스** | MIT |

---

## 주요 기능

- 멀티 언어 UI — KR / EN / VI / JP
- 문의 폼 — `POST /api/contact` → Google Sheets (+ 선택 Resend 메일)
- 반응형 랜딩

---

## 로컬 / 빌드

```bash
npm run build   # out/index.html 검증
```

자세한 배포: [README_CLOUDFLARE.md](README_CLOUDFLARE.md)

---

## 문의 폼

1. 사용자가 폼 제출 → `POST /api/contact`
2. Google Sheets 저장 (`GOOGLE_SHEETS_WEBHOOK_URL`)
3. (선택) Resend → **info@bambooasia.biz** (`CONTACT_EMAIL` / `RESEND_API_KEY`)

---

## 라이선스

MIT License. [LICENSE](LICENSE) 참고.
