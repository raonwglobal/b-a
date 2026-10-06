# Original source from b-a.cloudflare.zip

This folder holds the original Next.js 14 static-export source package.

**Production (Cloudflare Pages)** uses the static build pipeline:
- `scripts/full-page.html` + `scripts/i18n.js` → `out/`
- `src/worker.js` for `/api/contact` (Google Sheets + optional Resend)

Do **not** set Cloudflare build to `next build` / OpenNext — that path was abandoned after repeated deploy failures.

Contact email: info@bambooasia.biz  
Site: https://b-a.bambooasia.biz
