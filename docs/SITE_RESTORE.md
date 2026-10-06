# 사이트 원복 기록 (2026-10-06)

## 증상

배포 사이트(https://b-a.bambooasia.biz)가 **Vietnam Business Execution Platform** 이 아니라
**BambooAsia — Vietnam Bamboo Circular Materials** 로 표시됨.

## 근본 원인

빌드 스크립트(`scripts/cf-safe-build.mjs`)가 기본적으로 아래를 **실시간 미러** 했음:

```
https://www.bambooasia.biz  →  out/
```

그런데 **www.bambooasia.biz 원본 사이트의 제품/콘텐츠가 변경**됨:

| 이전 (기대) | 이후 (실제) |
|-------------|-------------|
| Vietnam Business Execution Platform | Vietnam Bamboo Circular Materials |
| Next.js `/_next/static/...` 자산 | 인라인 CSS 단일 HTML (~2.6MB) |
| 컨설팅·실행 플랫폼 | 대나무 순환 소재 플랫폼 |

Cloudflare 재배포마다 변경된 원본을 그대로 가져와 **b-a 사이트가 통째로 바뀜**.

구 Next 자산 URL도 동일 호스트에서 HTML로 응답해 복구 불가.

## 조치

1. **라이브 미러 기본값 제거**
2. 소스 오브 트루스: `scripts/full-page.html` → `out/index.html`
3. 문의: `info@bambooasia.biz`, `POST /api/contact` 유지
4. (선택) 디지털 명함: `scripts/digital-card.html` → `out/card/`

강제 미러가 필요할 때만:

```bash
BA_MIRROR_URL=https://example.com npm run build
```

## 확인

배포 후 페이지 제목/히어로에 다음이 보여야 함:

- `b/a - Vietnam Business Execution Platform`
- Circular Materials 문구 **없음**
