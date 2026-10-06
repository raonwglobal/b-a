# Cloudflare Pages 배포 (OpenNext 완전 배제)

## 필수: 대시보드 빌드 설정

Cloudflare가 `bunx opennextjs-cloudflare build` 를 실행하면 **설정이 잘못된 것**입니다.
아래처럼 **직접 덮어쓰기** 하세요.

**Workers & Pages → Pages 프로젝트 → Settings → Builds & deployments → Edit**

| 항목 | 값 (이것만) |
|------|-------------|
| Framework preset | **None** |
| **Build command** | `npm run build` |
| **Deploy command** | *(비움)* |
| **Build output directory** | `out` |
| Root directory | `/` |
| Node.js version | `20` |

### 금지 (있으면 삭제)

- `bunx opennextjs-cloudflare build`
- `npx opennextjs-cloudflare`
- `npx @cloudflare/next-on-pages`
- `wrangler deploy`
- Output directory = `.next`

저장 후 **Retry deployment**.

---

## 이 저장소의 빌드 정의

| 파일 | 역할 |
|------|------|
| `next.config.js` | `output: 'export'` → `out/` |
| `wrangler.toml` | `pages_build_output_dir = "out"` (Pages 전용) |
| `scripts/cf-pages-build.sh` | 정적 빌드만 수행 |
| `functions/` | Pages Functions (`/api/contact`) |

OpenNext 패키지·설정 파일은 **의도적으로 없음**.

---

## 빌드가 또 OpenNext로 가면

1. Framework preset 이 **Next.js** 인지 확인 → **None** 으로 변경
2. 프로젝트가 **Workers** 로 만들어졌는지 확인 → **Pages** 로 새로 연결 권장
3. 대안: Git 자동 빌드 끄고 GitHub Actions `Deploy Cloudflare Pages` 사용

---

## 로컬 검증

```bash
npm install
npm run build
test -f out/index.html && echo OK
```
