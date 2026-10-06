# b/a — 베트남 사업 실행 플랫폼

**Vietnam Business Execution Platform**

법인설립 · 거래·M&A · 산업별 현지화 · 보안·준법 · 현지 운영을 하나의 파트너와 함께 수행하는 실행형 컨설팅 플랫폼입니다.

시장조사부터 사업 실행과 운영관리까지 복잡한 절차를 체계적으로 연결해, 빠르고 안전한 베트남 사업 진입을 지원합니다.

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **서비스명** | b/a (b-a.asia) |
| **포지션** | Vietnam Business Execution Platform |
| **기술 스택** | Next.js 14 (Static Export) + Tailwind CSS + TypeScript |
| **배포 환경** | Cloudflare Pages + Pages Functions |
| **지원 언어** | 한국어 · English · Tiếng Việt · 日本語 |
| **라이선스** | MIT |

---

## 주요 기능

- **멀티 언어 UI** — KR / EN / VI / JP 실시간 전환
- **서비스 섹션** — 법인설립, 거래·M&A, 산업별 현지화, 보안·준법, 운영지원, 절차 안내
- **산업별 포커스** — 제조, 농업·식품, 물류, 관광·서비스, 유통, 친환경 제조 등
- **문의 폼** — Cloudflare Pages Functions 기반 `/api/contact` → **Google Sheets 저장**
- **반응형 디자인** — 모바일·데스크톱 최적화

---

## 로컬 개발

```bash
npm install
npm run dev
# → http://localhost:3000

npm run build
# → out/ 폴더 생성
```

Node.js 18 이상 권장.

---

## Cloudflare Pages 배포

자세한 가이드는 [README_CLOUDFLARE.md](README_CLOUDFLARE.md)를 참고하세요.

빠른 설정:
- Framework: Next.js (Static HTML Export)
- Build: `npm run build` / Output: `out`
- 환경 변수: `GOOGLE_SHEETS_WEBHOOK_URL` (문의 → 구글 시트)

---

## 프로젝트 구조

```
b-a/
├── app/page.tsx
├── functions/api/contact.ts
├── scripts/google-sheets-apps-script.gs
├── next.config.js
├── wrangler.toml
└── README_CLOUDFLARE.md
```

> `.agents/skills/luna-chat-coder` 는 프로젝트 코드에 포함되지 않습니다.

---

## 문의 폼 동작

1. 사용자가 문의 섹션에서 회사명, 담당자, 이메일, 업종, 투자규모, 지역, 요청 내용을 입력
2. 제출 시 `POST /api/contact` 로 JSON 전송
3. Pages Function이 검증 후:
   - **Google Sheets**에 행 추가 (`GOOGLE_SHEETS_WEBHOOK_URL` 설정 시)
   - (선택) Resend 이메일 발송
   - Cloudflare Functions 로그 기록
4. 성공/실패 응답을 UI에 표시 (`savedToSheet` 포함)

설정 방법은 [README_CLOUDFLARE.md](README_CLOUDFLARE.md)의 **문의 폼 저장: Google Sheets** 를 참고하세요.

---

## 라이선스

MIT License. [LICENSE](LICENSE) 파일을 참고하세요.
