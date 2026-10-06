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
- **문의 폼** — Cloudflare Pages Functions 기반 `/api/contact` 엔드포인트로 실제 접수
- **반응형 디자인** — 모바일·데스크톱 최적화

---

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev
# → http://localhost:3000

# 프로덕션 빌드 (Cloudflare Pages용 static export)
npm run build
# → out/ 폴더 생성
```

### 필수 환경

- Node.js 18 이상
- npm 또는 yarn

---

## Cloudflare Pages 배포

자세한 가이드는 [README_CLOUDFLARE.md](README_CLOUDFLARE.md)를 참고하세요.

### 빠른 배포 (GitHub 연결)

1. 이 리포지토리를 Cloudflare Dashboard > Workers & Pages > Create > Pages > Connect to Git
2. 설정값:
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node version**: 18 이상
3. Deploy → `https://<project>.pages.dev` 로 라이브
4. Custom Domain에 `b-a.asia` 연결 (무료 SSL 자동 발급)

### Pages Functions (문의 폼)

- `functions/api/contact.ts` 가 `/api/contact` 엔드포인트로 자동 배포됩니다.
- 환경 변수 (Pages > Settings > Variables):
  - `CONTACT_EMAIL` — 문의 수신 이메일
  - `RESEND_API_KEY` — (선택) Resend.com API Key (무료 100통/일)

---

## 프로젝트 구조

```
b-a/
├── app/
│   ├── page.tsx          # 메인 랜딩 페이지 (멀티언어 + 문의 폼)
│   ├── layout.tsx        # 메타데이터 · 루트 레이아웃
│   └── globals.css       # Tailwind + 글로벌 스타일
├── functions/
│   └── api/
│       └── contact.ts    # Cloudflare Pages Function (문의 접수)
├── next.config.js        # output: 'export' (정적 사이트)
├── wrangler.toml         # Cloudflare Pages 설정
├── tailwind.config.js
├── package.json
├── README.md
├── README.ko.md
└── README_CLOUDFLARE.md
```

> **참고**  
> `.agents/skills/luna-chat-coder` 및 관련 AGENTS.md는 **프로젝트 코드에 포함되지 않습니다**.  
> 해당 스킬은 에이전트 보조 개발 수단으로만 사용되며, 이 리포지토리의 배포·런타임 코드와는 무관합니다.

---

## 문의 폼 동작

1. 사용자가 문의 섹션에서 회사명, 담당자, 이메일, 업종, 투자규모, 지역, 요청 내용을 입력
2. 제출 시 `POST /api/contact` 로 JSON 전송
3. Pages Function이 검증 후 로그 기록 (및 설정된 경우 Resend로 이메일 발송)
4. 성공/실패 응답을 UI에 표시

---

## 라이선스

MIT License. [LICENSE](LICENSE) 파일을 참고하세요.
