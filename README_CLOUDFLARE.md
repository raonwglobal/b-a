# b/a - Cloudflare Pages 무료 배포 가이드

> ## ⚠️ 빌드 오류 방지 (중요)
>
> 이 프로젝트는 **Cloudflare Pages** 전용입니다. **Workers** 로 만들면 안 됩니다.
>
> | 항목 | 올바른 값 |
> |------|-----------|
> | 제품 | **Workers & Pages → Create → Pages** (Workers 아님) |
> | Framework preset | **Next.js (Static HTML Export)** 또는 None |
> | **Build command** | `npm run build` 만 (wrangler deploy 넣지 말 것) |
> | **Build output directory** | `out` |
> | Node version | 18 이상 |
>
> `Missing entry-point to Worker script` 오류는 `wrangler deploy`(Workers)를 썼을 때 납니다.  
> Pages는 빌드 후 `out/` 정적 파일 + `functions/` 를 자동으로 붙입니다.

## 왜 Cloudflare Pages 무료인가?

- **호스팅 100% 무료**: 트래픽 무제한, 대역폭 무제한
- **빌드 500회/월 무료**
- **도메인 100개까지 무료 연결, SSL 무료**
- **Pages Functions 무료**: 월 100,000 요청까지 무료 (문의 폼 처리용)

Cloudflare 무료 플랜으로도 b-a.asia 같은 비즈니스 사이트 충분히 운영 가능.

---

## 배포 방법 2가지 (택1)

### 방법 A: GitHub 연결 (추천, 자동 배포)

1. Cloudflare Dashboard > **Workers & Pages** > **Create** > **Pages** > Connect to Git
2. 리포지토리 `raonwglobal/b-a` 선택
3. 설정:
   - Framework preset: **Next.js (Static HTML Export)**
   - Build command: **`npm run build`**
   - Build output directory: **`out`**
   - Node version: **18** 이상
4. Save and Deploy

### 방법 B: CLI (로컬)

```bash
npm install
npm run build
npx wrangler pages deploy out
```

`wrangler deploy` 는 사용하지 마세요.

---

## 도메인 연결 (b-a.asia)

1. 도메인 구매 후 네임서버를 Cloudflare로 지정
2. Pages > Custom domains > `b-a.asia`
3. SSL 자동 발급

---

## 문의 폼 저장: Google Sheets (권장)

문의는 Google 스프레드시트에 한 행씩 저장됩니다.

### 1단계 — 스프레드시트

1. [Google Sheets](https://sheets.google.com) 새 문서
2. 1행 헤더: `접수시각 | 회사 | 담당자 | 이메일 | 업종 | 투자규모 | 진출지역 | 요청내용`

### 2단계 — Apps Script

1. 확장 프로그램 → Apps Script
2. `scripts/google-sheets-apps-script.gs` 내용 붙여넣기
3. 배포 → 새 배포 → 웹 앱 (실행: 나 / 액세스: 모든 사용자)
4. 웹 앱 URL 복사

### 3단계 — Cloudflare 변수

Pages → Settings → Variables:

| 변수 | 값 |
|------|-----|
| `GOOGLE_SHEETS_WEBHOOK_URL` | 웹 앱 URL |
| `CONTACT_EMAIL` | (선택) 알림 이메일 |
| `RESEND_API_KEY` | (선택) Resend 키 |

### 4단계 — 확인

폼 제출 후 시트 행 추가 여부 확인. 응답에 `savedToSheet: true` 이면 성공.

---

## 비용

| 항목 | 비용 |
|------|------|
| Pages + Functions | $0 |
| Google Sheets | $0 |
| 도메인 | 약 $10/년 |

---

## 관련 파일

- `functions/api/contact.ts` — 문의 API
- `scripts/google-sheets-apps-script.gs` — 시트 저장 스크립트
