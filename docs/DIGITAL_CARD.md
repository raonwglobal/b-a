# 디지털 명함 (Digital Card)

## 배포 URL

```text
https://b-a.bambooasia.biz/card/              # 멤버 목록
https://b-a.bambooasia.biz/card/{id}/         # 개인 명함 (예: taehoon)
https://b-a.bambooasia.biz/card/?id={id}      # 동일 (query 형식)
```

메인 사이트 네비게이션에는 **연결하지 않습니다.**

---

## 아키텍처 (현재)

```text
scripts/digital-card-lite.html   ← CSV 기반 클라이언트 SPA (소스 오브 트루스)
        ↓  npm run build:cards  (또는 npm run build)
out/card/index.html
out/card-spa.html                ← Worker 폴백 대상 ( /card/ 밖 )
out/card/{id}/index.html         ← 알려진 멤버 warm path (__CARD_ID__ 고정)
        ↓  wrangler [assets] + src/worker.js
https://b-a.bambooasia.biz/card/...
```

| 구성 요소 | 역할 |
|-----------|------|
| `digital-card-lite.html` | 플립 카드 UI, vCard, QR, 목록/상세 라우팅 |
| `build-digital-cards.mjs` | **카드 전용** 빌드 — `out/card/**` 만 기록 |
| `cf-safe-build.mjs` | 메인 전용 — `_redirects`에 `/card/:id → /card/?id=:id` (302) |
| `src/worker.js` | 정적 `/card/{id}` 없으면 `/card-spa.html` 로 폴백 |

메인 footer / `index.html` / `i18n.js` 와 **런타임·파일 모두 분리**되어 있습니다.

---

## 멤버 데이터 (Google Sheets CSV)

빌드 시 및 브라우저 런타임에 CSV를 읽습니다.

**필수 컬럼**

```text
id,name_kr,name_en,title_kr,title_en,phone,email
```

- `id`: URL 세그먼트 (영문 소문자·숫자 권장, 예: `taehoon`, `byeonggyu`)
- 시트는 **웹에 게시(CSV)** 되어야 합니다.
- 기본 CSV URL은 `scripts/build-digital-cards.mjs` / `digital-card-lite.html` 의 `DEFAULT_CSV` / `CSV_URL` 상수입니다.
- 빌드 시 덮어쓰기: `MEMBER_CSV_URL=... npm run build:cards`

### 신규 직원 추가

1. 시트에 행 추가 (`id` 포함)
2. CSV 게시가 최신인지 확인
3. **재배포 없이** `/card/?id={새id}` 또는 Worker 폴백 경로로 접근 가능  
   (warm path `/card/{id}/` 정적 파일을 쓰려면 `npm run build:cards` 후 배포)

---

## 기능

- 앞/뒤 플립 카드
- 전화 / 이메일 / 웹사이트 링크
- **vCard (.vcf) 저장** — Google/Apple 연락처
- **전·후면 QR** (vCard 페이로드, CorrectLevel L + 이미지 API 폴백)
- **QR 이미지 저장** (PNG)
- 링크 복사 · Web Share API
- 홈 화면 추가 안내 (iOS/Android)

정식 **Google Wallet Pass API** (발급자 계정·JWT 서명) 는 포함되어 있지 않습니다.

---

## 빌드 · 배포

```bash
# 카드만
npm run build:cards

# 전체 (메인 후 카드)
npm run build
```

Cloudflare에 `out/` 이 자산으로 배포되어야 합니다. 자세한 내용: [README_CLOUDFLARE.md](../README_CLOUDFLARE.md)

### 라우팅 주의

| 방식 | 사용 여부 | 이유 |
|------|-----------|------|
| `/card/* → /card/index.html` **200** | ❌ 금지 | CF Infinite loop (100324) |
| `/card/:id → /card/?id=:id` **302** | ✅ | `_redirects` |
| Worker → `/card-spa.html` | ✅ | 정적 파일 없을 때 |

---

## 로컬에서 템플릿 수정

```bash
# 편집
$EDITOR scripts/digital-card-lite.html

# 카드만 다시 빌드
npm run build:cards

# 커밋
git add scripts/digital-card-lite.html
git commit -m "fix(card): ..."
git push origin main
```

대용량 React 단일 파일(`digital-card.html` ~200KB) 방식은 **더 이상 기본 경로가 아닙니다.** 필요 시 part/b64 복구 경로는 빌드 스크립트에 남아 있으나, 운영 템플릿은 **lite SPA** 입니다.

---

## 예시 멤버 (fallback)

CSV 로드 실패 시 스크립트 내장 예시:

| id | 이름 | 메일 |
|----|------|------|
| taehoon | 김태훈 / Taehoon Kim | kim@bambooasia.biz |
| magnox | 정성영 / Seongyoung Jeong | magnox@bambooasia.biz |

메인 문의 메일 `info@bambooasia.biz` 와는 별개입니다.
