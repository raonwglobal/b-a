# 디지털 명함 (Digital Business Card)

## URL

**https://b-a.bambooasia.biz/card/**

## 포함 기능

- 플립 카드 UI (앞면 / 뒷면)
- 이름·직함 탭하여 편집
- 전화 / 이메일 / 웹사이트 바로가기
- vCard 저장, 링크 복사, 공유
- QR (사이트 이동)

## 카드에 들어간 연락처 (원본 아티팩트 기준)

| 항목 | 값 |
|------|-----|
| 이름 | 김태훈 / Taehoon Kim |
| 이메일 | kim@bambooasia.biz |
| 전화 | +84 093 685 0555 |
| 사이트 | https://b-a.bambooasia.biz |

메인 사이트 문의 메일(`info@bambooasia.biz`)과 별개입니다.

## 소스 파일

| 파일 | 설명 |
|------|------|
| `scripts/digital-card.html.gz.b64` | 압축·Base64된 단일 HTML (React 번들 포함) |
| `scripts/digital-card.html` | (선택) 비압축 HTML이 있으면 우선 사용 |
| `scripts/cf-safe-build.mjs` | 빌드 시 `out/card/index.html` 생성 |

## 수정 방법

1. HTML을 수정한 뒤:
   ```bash
   gzip -c -9 digital-card.html | base64 -w0 > scripts/digital-card.html.gz.b64
   ```
2. 커밋 후 Cloudflare 재배포
3. 배포 후 `/card/` 확인

## Worker

`src/worker.js`의 `ASSETS` 바인딩이 `out/` 전체를 서빙하므로 `/card/` 추가 코드 불필요.
