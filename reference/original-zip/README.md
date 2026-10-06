# Original source from `b-a.cloudflare.zip`

This folder stores the original Next.js 14 static-export package from the Cloudflare zip.

## Production mapping

| Zip (this folder) | Production (Cloudflare Pages) |
|---|---|
| `app/page.tsx` UI | `scripts/full-page.html` + `scripts/i18n.js` → `out/index.html` |
| `functions/api/contact.ts` | `src/worker.js` (`POST /api/contact`) |
| `wrangler.toml` pages dir | `wrangler.toml` + `[assets] directory = "./out"` |
| Next `output: 'export'` | `npm run build` → `scripts/cf-safe-build.mjs` |

## Why not run Next.js on Cloudflare?

Wrangler repeatedly auto-detected Next.js and injected **OpenNext**, which failed. Production uses a **static HTML port of the same UI**, with the contact API on the Worker.

## Contact

- Email: `info@bambooasia.biz`
- Site: https://b-a.bambooasia.biz

## Files here

- `package.json`, `next.config.js`, `tailwind.config.js`, `tsconfig.json`, `postcss.config.js`
- `app/layout.tsx`, `app/globals.css`
- `functions/api/contact.ts` (original stub)
- `wrangler.toml`

Full `app/page.tsx` design is reflected in production `scripts/full-page.html` (cream `#F9F5EB`, logo box, orbit hero, EXECUTION BOARD).
