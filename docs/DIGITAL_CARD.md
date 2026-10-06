# 디지털 명함 추가 방법

## 배포 URL

```
https://b-a.bambooasia.biz/card/
```

## 아키텍처

```
scripts/digital-card.html   ← 단일 HTML (React 번들 포함, ~200KB)
        ↓  npm run build (cf-safe-build.mjs)
out/card/index.html         ← 정적 산출물
        ↓  wrangler [assets] directory = "./out"
https://b-a.bambooasia.biz/card/
```

`src/worker.js`는 `ASSETS.fetch`로 `out/` 전체를 서빙하므로 **Worker 수정 불필요**합니다.

## 추가 절차 (로컬에서 1회)

1. 제공된 React Artifact HTML을 저장:

```bash
# 저장 위치
cp path/to/pasted-card.html scripts/digital-card.html
```

2. (권장) 제목·canonical 정리:

```html
<title>b/a Digital Card · 김태훈 · Bamboo Asia</title>
<link rel="canonical" href="https://b-a.bambooasia.biz/card/" />
```

3. 커밋 & 푸시:

```bash
git add scripts/digital-card.html scripts/cf-safe-build.mjs
git commit -m "feat: digital business card at /card/"
git push origin main
```

4. Cloudflare 재배포 후 확인:

```
https://b-a.bambooasia.biz/card/
```

## 카드에 포함된 연락처 (아티팩트 기준)

| 항목 | 값 |
|------|-----|
| 이름 | 김태훈 / Taehoon Kim |
| 이메일 | kim@bambooasia.biz |
| 전화 | +84 093 685 0555 |
| 웹 | https://b-a.bambooasia.biz |

메인 문의 메일 `info@bambooasia.biz` 와는 별개입니다.

## 기능

- 앞/뒤 플립 카드
- 이름·직함 인라인 편집
- 전화 / 이메일 / 웹사이트
- vCard 저장, 링크 복사, 공유
- QR 스캔 → 사이트

## 대안: gzip+base64 (대용량 Git 이슈 시)

```bash
gzip -c -9 scripts/digital-card.html | base64 -w0 > scripts/digital-card.html.gz.b64
# plain html 없이 b64만 커밋해도 빌드가 복원함
```
