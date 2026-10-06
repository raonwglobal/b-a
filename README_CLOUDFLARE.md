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

1. GitHub에 리포지토리 생성 후 이 폴더 푸시
```bash
git init
git add .
git commit -m "b/a initial"
git branch -M main
git remote add origin https://github.com/USERNAME/b-a.git
git push -u origin main
```

2. Cloudflare Dashboard > Workers & Pages > Create Application > Pages > Connect to Git

3. 설정:
   - Framework preset: Next.js (Static HTML Export)
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node version: 18 이상

4. Deploy 클릭 -> `https://b-a-xxx.pages.dev` 로 라이브

### 방법 B: 직접 업로드 (Git 없이 가장 빠름)

1. 로컬에서 빌드:
```bash
npm install
npm run build
```

2. Cloudflare Dashboard > Pages > Create > Direct Upload > `out` 폴더 드래그앤드롭

3. 30초 만에 배포 완료

---

## 도메인 연결 (b-a.asia) - 무료

1. Cloudflare Dashboard > Domain Registration에서 `b-a.asia` 구매 (연 $10 내외) 또는 외부에서 구매 후 네임서버만 Cloudflare로 변경

2. Pages > Custom domains > Set up a custom domain > `b-a.asia` 입력

3. 자동 SSL 발급 (무료) -> https://b-a.asia 로 접속

4. www 리다이렉트: Rules > Redirect Rules > `www.b-a.asia` -> `https://b-a.asia` 301

---

## 문의 폼 무료 처리 3가지 옵션

### 옵션 1: Cloudflare Pages Functions (이 폴더에 이미 포함됨, 완전 무료)

- `functions/api/contact.ts` 파일이 이미 있음
- Pages 배포 시 자동으로 `/api/contact` 엔드포인트 생성
- 현재는 로그만 남김, 이메일 전송하려면:

**무료 이메일 전송 추가:**
- Cloudflare Dashboard > Pages > Settings > Variables > `RESEND_API_KEY` 추가
  - Resend.com 가입 (무료 100통/일, 3000통/월)
  - API Key 발급
- `CONTACT_EMAIL` 변수에 받을 이메일 설정
- 코드 주석 해제하면 자동 발송

### 옵션 2: Formspree 무료 (코드 수정 없음)

- formspree.io 가입 (무료 50건/월)
- `app/page.tsx` 에서 `handleSubmit` 부분 fetch URL만 `https://formspree.io/f/xxxxx` 로 변경

### 옵션 3: Google Sheets 무료

- Google Apps Script로 무료 DB化
- 문의가 구글 시트에 자동 저장

---

## 비용 정리 (무료로 운영 시)

| 항목 | Cloudflare 무료 플랜 | 비용 |
|---|---|---|
| 호스팅 | Pages 무제한 트래픽 | $0 |
| SSL | 자동 발급 | $0 |
| 도메인 | b-a.asia 구매 시 연 1회 | ~$10/년 |
| 빌드 | 500회/월 | $0 |
| Functions (문의) | 100,000 요청/월 | $0 |
| 이메일 (Resend) | 100통/일 | $0 |
| **합계** | **도메인 제외 완전 무료** | **$0/월** |

---

## 다음 단계

1. `npm run build` 로 out/ 생성 확인
2. Cloudflare Pages에 배포
3. b-a.asia 도메인 연결
4. Resend API Key 설정하여 문의 폼 이메일 수신

도움이 필요하면 `functions/api/contact.ts` 부분만 알려주면 바로 연동해드립니다.
