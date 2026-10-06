# b/a - Cloudflare Pages 무료 배포 가이드

## 왜 Cloudflare Pages 무료인가?

- **호스팅 100% 무료**: 트래픽 무제한, 대역폭 무제한
- **빌드 500회/월 무료**
- **도메인 100개까지 무료 연결, SSL 무료**
- **Pages Functions 무료**: 월 100,000 요청까지 무료 (문의 폼 처리용)

Cloudflare 무료 플랜으로도 b-a.asia 같은 비즈니스 사이트 충분히 운영 가능.

---

## 배포 방법 2가지 (택1)

### 방법 A: GitHub 연결 (추천, 자동 배포)

1. GitHub에 리포지토리 연결 후 푸시된 상태 유지
2. Cloudflare Dashboard > Workers & Pages > Create Application > Pages > Connect to Git
3. 설정:
   - Framework preset: Next.js (Static HTML Export)
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node version: 18 이상
4. Deploy → `https://<project>.pages.dev`

### 방법 B: 직접 업로드

```bash
npm install && npm run build
```

Cloudflare Dashboard > Pages > Create > Direct Upload > `out` 폴더 업로드

---

## 도메인 연결 (b-a.asia)

1. 도메인 구매 후 네임서버를 Cloudflare로 지정 (또는 Cloudflare Registrar)
2. Pages > Custom domains > `b-a.asia`
3. SSL 자동 발급
4. (선택) `www.b-a.asia` → `https://b-a.asia` 301 Redirect Rule

---

## 문의 폼 저장: Google Sheets (권장)

문의 내용은 **Google 스프레드시트에 한 행씩 저장**됩니다.  
Cloudflare Function(`functions/api/contact.ts`)이 Google Apps Script 웹훅으로 POST 합니다.

### 1단계 — 스프레드시트 만들기

1. [Google Sheets](https://sheets.google.com)에서 새 문서 생성 (예: `b-a 문의 접수`)
2. **1행 헤더**를 아래처럼 입력:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| 접수시각 | 회사 | 담당자 | 이메일 | 업종 | 투자규모 | 진출지역 | 요청내용 |

### 2단계 — Apps Script 배포

1. 시트 메뉴 **확장 프로그램 → Apps Script**
2. 에디터에 `scripts/google-sheets-apps-script.gs` 내용 전체 붙여넣기 후 저장
3. **배포 → 새 배포**
   - 유형: **웹 앱**
   - 실행 주체: **나**
   - 액세스 권한: **모든 사용자**
4. 배포 후 표시되는 **웹 앱 URL** 복사  
   (예: `https://script.google.com/macros/s/XXXX/exec`)

> 코드를 수정한 뒤에는 **배포 → 배포 관리 → 새 버전**으로 다시 배포해야 URL이 최신 코드를 가리킵니다.

### 3단계 — Cloudflare 환경 변수

Pages 프로젝트 → **Settings → Environment variables** (Production):

| 변수명 | 값 |
|--------|-----|
| `GOOGLE_SHEETS_WEBHOOK_URL` | 위에서 복사한 웹 앱 URL |
| `CONTACT_EMAIL` | (선택) 알림 받을 이메일 |
| `RESEND_API_KEY` | (선택) Resend API 키 — 메일 알림용 |

저장 후 **재배포** 한 번 실행하는 것을 권장합니다.

### 4단계 — 동작 확인

1. 사이트 문의 폼에서 테스트 제출
2. 스프레드시트에 새 행이 추가되는지 확인
3. (선택) Cloudflare → 해당 Pages → **Logs** 에서 `New inquiry from b/a` / `Google Sheets` 로그 확인

응답 JSON 예:

```json
{ "success": true, "message": "문의가 접수되었습니다.", "savedToSheet": true }
```

`savedToSheet: false` 이면 웹훅 URL·배포 권한·Apps Script 실행 로그를 점검하세요.

### 보안 참고

- 웹 앱 URL을 아는 사람만 POST 할 수 있으므로, URL은 환경 변수로만 두고 공개 코드에 넣지 마세요.
- 스팸이 많으면 Apps Script에서 간단한 토큰 검증(`secret` 필드)을 추가할 수 있습니다.

---

## 다른 옵션 (참고)

| 방식 | 설명 |
|------|------|
| **Resend 이메일** | `RESEND_API_KEY` + `CONTACT_EMAIL` — 시트와 병행 가능 |
| **Formspree** | 폼 fetch URL만 변경, 월 50건 무료 |
| **로그만** | 변수 미설정 시 Cloudflare Functions 로그에만 기록 |

---

## 비용 정리 (무료 운영 시)

| 항목 | 비용 |
|------|------|
| Cloudflare Pages 호스팅·Functions | $0 |
| Google Sheets + Apps Script | $0 |
| Resend (선택, 100통/일) | $0 |
| 도메인 b-a.asia | 약 $10/년 |

---

## 관련 파일

- `functions/api/contact.ts` — 접수 API (시트 웹훅 + Resend)
- `scripts/google-sheets-apps-script.gs` — 시트에 행 추가하는 Apps Script 원본
