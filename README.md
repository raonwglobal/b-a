# b/a — Vietnam Business Execution Platform

**베트남 사업 실행 플랫폼**

법인설립 · 거래·M&A · 산업별 현지화 · 보안·준법 · 현지 운영을 하나의 파트너와 함께 수행하는 실행형 컨설팅 플랫폼입니다.

한국어 문서: [README.ko.md](README.ko.md)

---

## Overview

| Item | Detail |
|------|--------|
| **Service** | b/a |
| **Website** | [https://b-a.bambooasia.biz](https://b-a.bambooasia.biz) |
| **Contact** | info@bambooasia.biz |
| **Position** | Vietnam Business Execution Platform |
| **Deploy** | Cloudflare Worker (`src/worker.js`) + static assets (`out/`) |
| **Languages** | Korean · English · Tiếng Việt · 日本語 |
| **License** | MIT |

---

## Features

- **Multi-language landing** — KR / EN / VI / JP (`scripts/i18n.js`)
- **Contact form** — `POST /api/contact` → Google Sheets webhook (+ optional Resend email)
- **Privacy consent** on inquiry form (required checkbox)
- **Legal pages** — `/privacy`, `/terms`, `/email-refusal`
- **Digital business cards** — `/card/` (CSV-driven SPA, not linked from main nav)
- **Responsive UI** recovered from repo templates (not live-mirrored from external sites)

---

## Architecture

```text
npm run build
├── scripts/cf-safe-build.mjs      # MAIN only
│     → out/index.html, i18n.js, 404.html, _redirects
│     → privacy.html, terms.html, email-refusal.html
│     → footer injection (office, legal, related sites)
└── scripts/build-digital-cards.mjs  # CARDS only
      → out/card/** , out/card-spa.html
      (never touches main index / footer)

Runtime:
  src/worker.js
    · POST /api/contact
    · /card/{id} fallback → /card-spa.html when static file missing
    · other paths → ASSETS (out/)
```

Main site and digital cards are **independent at runtime**. They share one deploy pipeline but write different output trees.

> Historical note: builds used to mirror `www.bambooasia.biz`, which overwrote the execution-platform UI when that site changed. See [docs/SITE_RESTORE.md](docs/SITE_RESTORE.md). **Live mirror is no longer the default.**

---

## Build

```bash
npm run build         # main + cards
npm run build:main    # main site only
npm run build:cards   # digital cards only
```

Requires Node.js ≥ 18.

Main UI source of truth (recovery order):

1. `scripts/full-page.html` (if valid, not PLACEHOLDER)
2. `scripts/full-page.html.gz.b64`
3. `scripts/full-page.part*.b64`
4. Git history fallback commit

Deploy guide: [README_CLOUDFLARE.md](README_CLOUDFLARE.md)

---

## Contact form

1. User submits inquiry → `POST /api/contact`
2. Optional: Google Sheets via `GOOGLE_SHEETS_WEBHOOK_URL`
3. Optional: Resend email to `CONTACT_EMAIL` (default `info@bambooasia.biz`) with `RESEND_API_KEY`

Apps Script sample: `scripts/google-sheets-apps-script.gs`

---

## Digital cards

| URL | Purpose |
|-----|---------|
| `/card/` | Member list |
| `/card/{id}/` or `/card/?id={id}` | Member card |

- Template: `scripts/digital-card-lite.html` (client SPA)
- Members: published Google Sheets CSV (`id,name_kr,name_en,title_*,phone,email`)
- Features: flip card, vCard download, QR (front/back), QR image save, share/copy
- Not linked from the main navigation

Details: [docs/DIGITAL_CARD.md](docs/DIGITAL_CARD.md)

---

## Legal & footer

Built into the main footer and static pages:

- `/privacy` — Privacy policy
- `/terms` — Terms of use
- `/email-refusal` — Email collection refusal

---

## License

MIT License. See [LICENSE](LICENSE).
