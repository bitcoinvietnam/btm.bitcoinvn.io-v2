# Project Instructions

## Overview

BitcoinVN BTM marketing site — static site for Bitcoin ATM locations in Vietnam. Eleventy 3.x, Nunjucks templates, YAML-driven content. Five locales: English at `/`, Russian at `/ru/`, Korean at `/ko/`, Japanese at `/ja/`, Chinese (Simplified) at `/zh/`.

## Commands

- `npm run dev` — Dev server with hot reload
- `npm run build` — Build to `_site/`
- `npm run clean` — Remove `_site/`

## Architecture

Data-driven multi-locale site: `src/_data/*.yaml` + `src/_data/i18n/*.yaml` → Nunjucks → `_site/`.

Generated pages (one per locale × template):
- Home page from `src/index.njk`
- Host BTM page from `src/host.njk`
- Location detail pages from `src/locations.njk` (paginated over `collections.btmLocationsAll`)

### Key files

| Path | Purpose |
|------|---------|
| `.eleventy.js` | Config: YAML data, passthrough copy, CSS/JS pipeline (CleanCSS + terser in production), `pad` filter, `relative-urls` transform, missing-key validator (warn-only) |
| `src/index.njk` | Home page (nav, hero, features, locations, how-it-works, FAQ, host CTA, contact) |
| `src/locations.njk` | Location detail (one page per locale × machine) |
| `src/host.njk` | Host BTM landing page |
| `src/_includes/base.njk` | HTML shell — fonts, Leaflet, Plausible |
| `src/_includes/footer.njk` | Shared footer (included by all pages) |
| `src/_includes/locale-switcher.njk` | Language switcher dropdown |
| `src/_includes/icons/*.svg` | SVG partials referenced by `features.yaml` icon field |
| `src/css/styles.css` | Single stylesheet — minified by CleanCSS in production |
| `src/js/main.js` | Vanilla JS — minified by terser in production |

### Data files

| File | Purpose |
|------|---------|
| `src/_data/site.yaml` | Brand info, contact links, notice banner toggle (non-translatable) |
| `src/_data/locations.yaml` | BTM locations: slug, lat/lng, address, phone, hours, photos (non-translatable) |
| `src/_data/features.yaml` | Feature card icon references only |
| `src/_data/locales.yaml` | Supported locale codes — drives pagination |
| `src/_data/i18n/en.yaml` | All translatable text (source of truth) |
| `src/_data/i18n/ru.yaml` | Russian translations |
| `src/_data/i18n/ko.yaml` | Korean translations |
| `src/_data/i18n/ja.yaml` | Japanese translations |
| `src/_data/i18n/zh.yaml` | Chinese (Simplified) translations |

Standalone `howItWorks.yaml` / `faq.yaml` files at `src/_data/` are deprecated and unread — both `how_it_works` and `faq.items` now live under `i18n/<locale>.yaml`.

`locations.yaml` carries English `hours.display`; per-locale overrides go in `i18n/<locale>.yaml` under `locations.regions[i].machines.<slug>.hours_display`.

## Translations

Template access: `{% set t = i18n[pageLocale.code] %}` (note `.code` — `pageLocale` is the full locale object). Location detail template uses `i18n[item.locale]` since it paginates over a merged collection.

**Adding any translatable string:**
1. Add English to `en.yaml`
2. Add **real translations** to `ru.yaml`, `ko.yaml`, `ja.yaml`, `zh.yaml` — pasting English as a placeholder is not acceptable
3. `npm run build` — missing-key validator warns (does not error); templates fall back to English at render time

## Adding content

| What | Geo / non-translatable | Translatable (all 5 locales) |
|------|------------------------|------------------------------|
| New location | `locations.yaml`: slug, lat/lng, address, phone, hours, photo paths | `i18n/<locale>.yaml`: machine description, photo captions, `hours_display` |
| New FAQ item | — | `faq.items[]` in each `i18n/<locale>.yaml` |
| New feature card | SVG file in `src/_includes/icons/` + reference in `features.yaml` | `features.items[]` title/description in each `i18n/<locale>.yaml` |
