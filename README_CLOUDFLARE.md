# b/a — Cloudflare Pages 배포 (정적 Next.js)

## 이 프로젝트가 아닌 것

| Cloudflare가 쓰는 명령 | 이 프로젝트 |
|------------------------|-------------|
| `bunx opennextjs-cloudflare build` | **사용 안 함** |
| `wrangler deploy` | **사용 안 함** |
| 산출물 `.next` / Worker SSR | 산출물 **`out/`** + **Pages Functions** |

GitHub Actions는 `npm run build` → `out/` 까지 **통과**했습니다.  
아래 오류는 **대시보드 빌드 명령이 잘못**된 것입니다.

```
Running custom build `bunx opennextjs-cloudflare build` failed
```

---

## 대시보드에서 고치는 방법 (필수)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. **Pages** 프로젝트 선택 (Workers 아님)
3. **Settings** → **Builds & deployments** → **Build configurations** → **Edit**

### 넣을 값

| 항목 | 값 |
|------|-----|
| Framework preset | **None** (또는 Next.js Static HTML Export) |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| Root directory | `/` (비움) |
| **Deploy command** | **비움** |
| Environment variables (build) | 비움 가능 |
| Node.js version | `20` |

### 지우거나 바꾸면 안 되는 것

- `bunx opennextjs-cloudflare build` ← **삭제**
- `npx @cloudflare/next-on-pages` ← **삭제**
- `wrangler deploy` ← **삭제**
- Output directory 가 `.next` 인 경우 → **`out`으로 변경**

4. **Save** 후 **Deployments** → **Retry deployment** (또는 새 배포)

---

## 왜 OpenNext가 뜨는가

Framework preset 을 **Next.js** (SSR) 로 두면 Cloudflare가 자동으로:

```bash
bunx opennextjs-cloudflare build
```

을 넣습니다. 이 프로젝트는 `next.config.js` 에 `output: 'export'` 만 있는 **순수 정적 사이트**라 OpenNext와 맞지 않습니다.

Preset 을 **None** 으로 두고 명령을 수동으로 `npm run build` / `out` 으로 고정하세요.

---

## 로컬·CI와 동일한 명령

```bash
npm install
npm run build
# → out/index.html 생성
```

문의 API: `functions/api/contact.ts` (Pages Functions, 빌드 명령과 무관하게 폴더만 있으면 됨)

---

## Google Sheets 문의 저장

Pages → Settings → **Variables**:

- `GOOGLE_SHEETS_WEBHOOK_URL` = Apps Script 웹 앱 URL

스크립트: `scripts/google-sheets-apps-script.gs`
