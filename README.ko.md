# b/a — 베트남 사업 실행 플랫폼

**Vietnam Business Execution Platform**

법인설립 · 거래·M&A · 산업별 현지화 · 보안·준법 · 현지 운영을 하나의 파트너와 함께 수행하는 실행형 컨설팅 플랫폼입니다.

English: [README.md](README.md)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **서비스명** | b/a |
| **웹사이트** | [https://b-a.bambooasia.biz](https://b-a.bambooasia.biz) |
| **문의** | info@bambooasia.biz |
| **포지션** | Vietnam Business Execution Platform |
| **배포** | Cloudflare Worker (`src/worker.js`) + 정적 자산 (`out/`) |
| **지원 언어** | 한국어 · English · Tiếng Việt · 日本語 |
| **라이선스** | MIT |

---

## 주요 기능

- **다국어 랜딩** — KR / EN / VI / JP (`scripts/i18n.js`)
- **문의 폼** — `POST /api/contact` → Google Sheets 웹훅 (+ 선택 Resend 메일)
- **개인정보 동의** 체크박스 (문의 제출 필수)
- **법적 페이지** — `/privacy`, `/terms`, `/email-refusal`
- **디지털 명함** — `/card/` (CSV 기반 SPA, 메인 네비 미연결)
- **반응형 UI** — 레포 템플릿 복구 (외부 사이트 실시간 미러 없음)

---

## 아키텍처

```text
npm run build
├── scripts/cf-safe-build.mjs        # 메인 전용
│     → out/index.html, i18n.js, 404.html, _redirects
│     → privacy.html, terms.html, email-refusal.html
│     → footer 주입 (사업장, 약관, 관련 사이트)
└── scripts/build-digital-cards.mjs  # 카드 전용
      → out/card/** , out/card-spa.html
      (메인 index / footer 미접촉)

런타임:
  src/worker.js
    · POST /api/contact
    · /card/{id} 정적 파일 없으면 → /card-spa.html
    · 그 외 → ASSETS (out/)
```

메인 사이트와 디지털 카드는 **런타임에서 독립**입니다. 배포 파이프라인만 공유하고 산출 경로는 다릅니다.

> 참고: 과거 빌드가 `www.bambooasia.biz`를 미러하면서 UI가 다른 제품으로 덮인 이력이 있습니다. [docs/SITE_RESTORE.md](docs/SITE_RESTORE.md) 참고. **현재 기본값은 라이브 미러가 아닙니다.**

---

## 빌드

```bash
npm run build         # 메인 + 카드
npm run build:main    # 메인만
npm run build:cards   # 디지털 카드만
```

Node.js ≥ 18 필요.

메인 UI 복구 순서:

1. `scripts/full-page.html` (유효하고 PLACEHOLDER가 아닐 때)
2. `scripts/full-page.html.gz.b64`
3. `scripts/full-page.part*.b64`
4. Git 히스토리 폴백 커밋

배포 안내: [README_CLOUDFLARE.md](README_CLOUDFLARE.md)

---

## 문의 폼

1. 사용자 제출 → `POST /api/contact`
2. (선택) `GOOGLE_SHEETS_WEBHOOK_URL` 로 Google Sheets 저장
3. (선택) `RESEND_API_KEY` + `CONTACT_EMAIL`(기본 `info@bambooasia.biz`) 로 메일 발송

Apps Script 예시: `scripts/google-sheets-apps-script.gs`

---

## 디지털 명함

| URL | 용도 |
|-----|------|
| `/card/` | 멤버 목록 |
| `/card/{id}/` 또는 `/card/?id={id}` | 개인 명함 |

- 템플릿: `scripts/digital-card-lite.html` (클라이언트 SPA)
- 멤버: Google Sheets CSV (`id,name_kr,name_en,title_*,phone,email`)
- 기능: 플립 카드, vCard 저장, 전·후면 QR, QR 이미지 저장, 공유/링크 복사
- 메인 네비게이션에 **연결되지 않음**

상세: [docs/DIGITAL_CARD.md](docs/DIGITAL_CARD.md)

---

## 약관 · 푸터

메인 푸터 및 정적 페이지:

- `/privacy` — 개인정보처리방침
- `/terms` — 이용약관
- `/email-refusal` — 메일수집거부

---

## 라이선스

MIT License. [LICENSE](LICENSE) 참고.
