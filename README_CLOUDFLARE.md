# Cloudflare 배포 가이드

**사이트:** https://b-a.bambooasia.biz  
**문의:** info@bambooasia.biz  

> 이 문서는 **현재 레포 구현** 기준입니다. 외부 사이트 실시간 미러는 사용하지 않습니다.

---

## 배포 모델

```toml
# wrangler.toml
name = "b-a"
main = "src/worker.js"
compatibility_date = "2024-11-01"

[assets]
directory = "./out"
binding = "ASSETS"
```

| 구성 | 역할 |
|------|------|
| **Worker** `src/worker.js` | `POST /api/contact`, `/card/{id}` SPA 폴백, 정적 자산 전달 |
| **Assets** `out/` | `npm run build` 산출물 (메인 + 카드 + 법적 페이지) |

Pages Function 경로 `functions/api/contact.ts` 도 동일 로직을 담고 있으나, **현재 wrangler 기준 진입점은 Worker** 입니다.

---

## 빌드

```bash
npm run build         # 권장: 메인 + 카드
npm run build:main    # 메인만 (footer / privacy / terms / redirects)
npm run build:cards   # 카드만 (out/card, out/card-spa.html)
```

### 메인 빌드 (`cf-safe-build.mjs`)

1. `out/` 삭제 후 재생성
2. UI 복구: `full-page.html` → `full-page.html.gz.b64` → parts → git history
3. CTA/이메일 scrub, footer 블록·동의 체크박스 주입
4. `i18n.js` 로드 + packages/targets compat + footer 다국어 키 병합
5. 출력: `index.html`, `i18n.js`, `404.html`, `_redirects`
6. 복사: `privacy.html`, `terms.html`, `email-refusal.html`

### 카드 빌드 (`build-digital-cards.mjs`)

1. `scripts/digital-card-lite.html` 로드
2. Google Sheets CSV에서 멤버 목록 fetch (실패 시 내장 fallback)
3. `out/card/index.html`, `out/card-spa.html` 기록
4. 알려진 `id`마다 `out/card/{id}/index.html` ( `__CARD_ID__` 고정)

카드 빌드는 **메인 index / i18n / footer를 수정하지 않습니다.**

---

## `_redirects` (카드 URL)

메인 빌드가 기록하는 규칙 예:

```text
/card/:id   /card/?id=:id  302
/card/:id/  /card/?id=:id  302
```

- **302 + query** 를 사용합니다. `/card/* → /card/index.html 200` 형태는 Cloudflare에서 **Infinite loop (code 100324)** 를 유발할 수 있어 사용하지 않습니다.
- Worker는 정적 `/card/{id}/` 가 없을 때 `/card-spa.html` 로 폴백합니다.

---

## 환경 변수

Cloudflare 대시보드 (Worker / Pages) 또는 `wrangler secret` 로 설정:

| 변수 | 필수 | 설명 |
|------|------|------|
| `GOOGLE_SHEETS_WEBHOOK_URL` | 권장 | Apps Script 웹 앱 URL — 문의 행 저장 |
| `RESEND_API_KEY` | 선택 | Resend API 키 — 알림 메일 |
| `CONTACT_EMAIL` | 선택 | 수신 메일 (기본 `info@bambooasia.biz`) |
| `MEMBER_CSV_URL` | 선택 | 카드 멤버 CSV (빌드 시; 기본값은 스크립트 내 DEFAULT_CSV) |

문의 시트용 Apps Script 예시: `scripts/google-sheets-apps-script.gs`

---

## 배포 절차 (요약)

1. `npm run build` 로컬 또는 CI에서 실행 → `out/` 생성
2. `wrangler deploy` (또는 Cloudflare Git 연동 빌드 명령: `npm run build`)
3. 확인:
   - https://b-a.bambooasia.biz/
   - https://b-a.bambooasia.biz/card/
   - 문의 폼 1건 테스트 (Sheets / 메일)
   - `/privacy`, `/terms`, `/email-refusal`

---

## 문제 해결

| 증상 | 조치 |
|------|------|
| UI가 다른 제품(대나무 소재 등)으로 보임 | 라이브 미러 사용 여부 확인. 기본은 레포 gz 복구여야 함 → [docs/SITE_RESTORE.md](docs/SITE_RESTORE.md) |
| `_redirects` Infinite loop 100324 | `/card/*` → `index.html` **200** 규칙 제거. **302 query** 또는 Worker 폴백만 사용 |
| `/card/{신규id}/` 404 | CSV에 `id` 행 추가 + 게시. Worker 폴백/`card-spa.html` 배포 여부 확인. 필요 시 `npm run build:cards` 후 재배포 |
| Footer 깨짐 / 번역 누락 | `i18n.js` 완전본(VI, `footer_brand`) 커밋 여부, `cf-safe-build` 로그만 확인 (카드 빌드와 분리됨) |
| 문의가 시트에 안 쌓임 | `GOOGLE_SHEETS_WEBHOOK_URL` 및 Apps Script 배포 권한 확인 |

---

## 관련 문서

- [README.md](README.md) / [README.ko.md](README.ko.md)
- [docs/DIGITAL_CARD.md](docs/DIGITAL_CARD.md)
- [docs/SITE_RESTORE.md](docs/SITE_RESTORE.md)
