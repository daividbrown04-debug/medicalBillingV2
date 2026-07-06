# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Active redesign — two design systems coexist right now

The site is mid-migration to **"v3" (Midnight Clarity)** — a dark-first, GSAP-animated rebuild.

- **`index.html`** is the new v3 flagship: links `assets/css/v3.css` + `assets/js/v3.js`, loads GSAP 3.13 from cdnjs (core + ScrollTrigger + SplitText), supports light/dark theming (`data-theme` on `<html>`, persisted to `localStorage['cc-theme']`). Original homepage preserved at **`index-legacy.html`**.
- **The other 13 pages** still use the legacy `assets/css/style.css` warm-paper design. They work and are SEO-complete, but visually do NOT match the new homepage yet. Navigating from the new index to e.g. `faq.html` is a deliberate-but-temporary style jump until propagation.
- **v3 dependencies:** GSAP via cdnjs (CSP in `_headers`/`.htaccess` already allowlists `https://cdnjs.cloudflare.com` for `script-src`, with a SHA-256 hash for the inline theme-init script — if you edit that inline script, recompute the hash in both files). The hero `<video>` expects `assets/video/hero.mp4` (not committed); a pure-CSS aurora `.hero-fallback` shows when it's absent.
- **Propagation plan:** port the remaining 13 pages to v3.css/v3.js. Their unique components (calculators `.calc-wrap`, `.health-score-wrap`, `.auth-row`, `.roi-stat-row`, etc.) live only in legacy `style.css` and must be re-styled in v3 before those pages convert cleanly.

## What this is

A static, multi-page marketing website for **ClearCycle RCM**, a US medical billing / revenue-cycle-management company. No framework, no bundler, no `package.json` — just hand-authored HTML at the repo root plus shared `assets/css/style.css` and `assets/js/main.js`. There is no dev server; open the `.html` files directly in a browser (or serve the folder statically) to preview.

## Build / partials system — read this before editing the header or footer

`partials/header.html` and `partials/footer.html` are injected into pages by `build.ps1`, which replaces the `<!--@HEADER-->` and `<!--@FOOTER-->` markers in every root `*.html` file:

```powershell
.\build.ps1
```

**Critical gotcha:** injection is one-shot and destructive. Once `build.ps1` runs, the markers are gone (replaced by the partial's content), and the pages have since been hand-edited per-page (e.g. `index.html`'s nav has `aria-current="page"` and an inline phone SVG the partial lacks). Re-running `build.ps1` therefore does **nothing** on existing pages, and editing a partial will **not** propagate to already-built pages.

Consequences:
- To change the header/footer on the live pages, edit the inlined `<header class="site-header">` / `<footer class="site-footer">` block in **each** HTML file (14 of them), not just the partial.
- The partials are effectively a scaffolding template for *new* pages: paste the markers into a new page, run `build.ps1`, then customize.
- Keep `partials/` in sync with manual edits if you want it to stay a usable template.

Always write HTML/CSS/JS files as **UTF-8 without BOM** — `build.ps1` reads and writes with a no-BOM UTF-8 encoder, and the page content uses typographic characters (en dashes, ×, ·, ©). Note: Windows PowerShell 5.1 reads a BOM-less `.ps1` as CP1252, so **never put non-ASCII literals inside a `.ps1`** — use `[char]0x2014` for an em dash, etc. (literal `—` in a script becomes `â€"` mojibake on write).

### `seo-enhance.ps1` (head/meta enrichment)

Idempotent, sentinel-guarded (`<!-- seo:enhanced -->`). Injects into every root page: robots/theme-color/favicon/manifest meta, Open Graph + Twitter cards, per-page JSON-LD (`@graph` with Organization, WebSite, BreadcrumbList, and Service nodes on the 6 service pages), a `.skip-link`, `id="main"` on `<main>`, and `defer` on the script tag. Re-running is safe (skips already-enhanced pages). Per-page breadcrumb labels and Service descriptions live in the `$pages` map inside the script — edit there, not in the HTML. `404.html` is hand-maintained and intentionally carries no sentinel.

## Architecture

**Pages** (root `*.html`): `index.html` is the long-form homepage. Service pages — `revenue-cycle-management`, `credentialing`, `prior-authorization`, `eligibility-verification`, `denial-management`, `ar-recovery` — are linked from the Services dropdown. Plus `services`, `specialties`, `about`, `blog`, `faq`, `careers`, `contact`. Every page links `assets/css/style.css` and (near `</body>`) `assets/js/main.js`.

**CSS (`assets/css/style.css`, single file ~1150 lines):** Design-system-driven. All colors, radii, shadows, fonts, and easings are CSS custom properties in `:root` — use these tokens rather than hardcoding values. The palette is deliberately emerald / warm-paper / deep-ink (not the default healthcare blue); type pairing is Fraunces (`--font-display`) + Inter (`--font-body`), loaded from Google Fonts in each page `<head>`. The file is organized into labeled section comments (`/* ---------- Header ---------- */`, `Hero`, `Bento grid`, `Calculator`, etc.) that map to the visual components used across pages.

**JS (`assets/js/main.js`, single IIFE, vanilla — no dependencies):** Progressive enhancement only; pages work without it. Behavior is wired by class/attribute hooks, so markup must use the expected selectors:
- Scroll: `.scroll-progress` bar, sticky `.site-header.scrolled`, `.back-top`, `.mobile-cta-bar`.
- Custom cursor: `.cursor-dot` / `.cursor-ring` (hover-capable pointers only).
- Reveal-on-scroll via `IntersectionObserver`: add `.reveal` / `.reveal-left` / `.reveal-right` / `.reveal-scale` (and component classes like `.dash`, `.proc-step`) — observer adds `.in-view`.
- Animated numbers: `[data-count]` (animated counters), `.meter-fill[data-fill]`, `.ring-fill` rings.
- UI widgets: `.acc-item` accordions, `.tabs` (button `data-tab` → panel `#id`), mobile `.nav-toggle`, `.ab-close` announcement-bar dismiss.
- Interactive tools keyed by IDs the JS queries directly: revenue calculator (`[data-calculator]` with `#calc-monthly`, `#calc-denial`, `#calc-providers` → `#out-*` / `#calc-recovered` etc.), Practice Health Score (`#hs-*`), Denial Risk Predictor (`#dp-*`). Changing these IDs breaks the tools.
- `[data-year]` elements are auto-filled with the current year.

## Conventions

- Internal links are relative (`services.html`, `index.html#calculator`) — keep all pages flat at the repo root so links resolve.
- SVG icons are inlined in the HTML (no icon font / sprite).
- When adding a component, prefer reusing an existing CSS section and its tokens over introducing new styles; match the existing section-comment structure if you must add one.

## Site infrastructure files

`robots.txt`, `sitemap.xml` (update `<lastmod>` and add new pages when routes change), `site.webmanifest`, `favicon.svg`, `404.html`, and security/caching headers in both `_headers` (Netlify/Cloudflare Pages) and `.htaccess` (Apache) — keep the CSP in those two files in sync. `assets/img/og-default.svg` is the social share image; **it is an SVG placeholder** — most social scrapers (Facebook/LinkedIn/X) do not render SVG OG images, so export a 1200×630 PNG and repoint the `og:image`/`twitter:image` URLs (in `seo-enhance.ps1` and existing pages) before launch.

## Permissions

`.claude/settings.local.json` pre-allows `build.ps1`, `fix-encoding.ps1` (not currently present), `Remove-Item`, and `WebSearch`.
