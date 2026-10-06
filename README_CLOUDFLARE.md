# Cloudflare 배포 (정적 out/)

## 오류: Missing entry-point to Worker script or to assets directory

원인: 파이프라인이 `wrangler deploy` 를 실행하는데,
`pages_build_output_dir` 만 있으면 deploy 가 assets 경로를 모릅니다.

해결: `wrangler.toml` 에 다음을 사용합니다.

```toml
[assets]
directory = "./out"
```

## 대시보드

| 항목 | 값 |
|------|-----|
| Framework | **None** |
| Build command | `npm run build` |
| Output directory | `out` |

Build 가 `out/index.html` 을 확인한 뒤, deploy 가 `./out` assets 를 올립니다.

문의 API: `functions/api/contact.ts` (Pages Functions — Pages 프로젝트에 연결된 경우).
Workers-only assets 배포 시 Functions 는 별도 설정이 필요할 수 있습니다.
