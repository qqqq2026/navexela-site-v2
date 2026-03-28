# Navexela — Cloudflare Pages deploy prep

This folder is ready for a fast static deploy.

## Use this folder
`/data/.openclaw/workspace/navexela-site-v2`

## Cloudflare Pages settings
- **Framework preset:** None
- **Build command:** *(leave empty)*
- **Build output directory:** `.`
- **Root directory:** `navexela-site-v2` *(if deploying from repo root)*

## Files already prepared
- `index.html`
- `styles.css`
- `script.js`
- `_headers` → basic security + caching headers
- `_redirects` → SPA-safe fallback to `index.html`

## Go-live flow
1. Push this folder to GitHub
2. Create a new Cloudflare Pages project from that repo
3. Set the root directory to `navexela-site-v2`
4. Leave build command empty
5. Output directory = `.`
6. Deploy
7. Attach custom domain in Cloudflare
8. Point DNS to Pages

## Notes
- Site is static, so Pages is the right fit.
- External images currently load from Supabase.
- Best for today: deploy first, refine copy/assets after.
