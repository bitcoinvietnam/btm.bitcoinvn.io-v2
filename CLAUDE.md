# Project Instructions

This file provides guidance to AI coding agents working with this repository.

## Project Overview

BitcoinVN BTM marketing site — a static website for Bitcoin ATM locations in Vietnam. Built with Eleventy (11ty) 3.x, Nunjucks templates, and YAML-driven content. Generates a home page per locale plus individual location detail pages per locale.

## Commands

- `npm run dev` — Start dev server with hot reload (typically localhost:8080 or 8081)
- `npm run build` — Build static site to `_site/`
- `npm run clean` — Remove `_site/` output directory

## Architecture

**Data-driven multi-locale site.** All content lives in YAML files (`src/_data/`), templates render it.

```
src/_data/*.yaml + src/_data/i18n/*.yaml → Nunjucks templates → _site/
```

Generated pages:
- `/` and `/ru/` — Home pages (one per locale, from `src/index.njk`)
- `/locations/<slug>/` and `/ru/locations/<slug>/` — Location detail pages (from `src/locations.njk`, paginated over `collections.btmLocationsAll`)

### Key files

- `.eleventy.js` — Config: YAML data extension via js-yaml, passthrough copy for css/js/images, `pad` filter, `relative-url` transform (converts root-relative hrefs to depth-relative at build time), missing-key build validator
- `src/index.njk` — Home page: nav, hero, features, locations, how-it-works, FAQ, contact, footer
- `src/locations.njk` — Location detail page template (paginated, generates one page per locale × location)
- `src/_includes/base.njk` — HTML shell (head, external deps, body wrapper)
- `src/_includes/locale-switcher.njk` — Language switcher dropdown, included in both templates
- `src/_includes/icons/*.svg` — SVG icon partials included by name from `features.yaml` icon field

### Data files

| File | Purpose | Template access |
|------|---------|-----------------|
| `src/_data/site.yaml` | Brand info, contact links, notice banner toggle | `{{ site.name }}`, `{{ site.contact.telegram.url }}` |
| `src/_data/locations.yaml` | BTM locations: slug, lat/lng, address, phone, hours, photos (non-translatable) | `{% for region in locations.regions %}` |
| `src/_data/features.yaml` | Feature card icon references only | `{% for feature in features.items %}` |
| `src/_data/locales.yaml` | List of supported locale codes | drives pagination in both templates |
| `src/_data/i18n/en.yaml` | All translatable text: UI strings, section headings, FAQ, features, how-it-works steps, location/region descriptions, photo captions | `{% set t = i18n[pageLocale] %}` then `{{ t.ui.xxx }}` |
| `src/_data/i18n/ru.yaml` | Russian translations | same as above |

> `howItWorks.yaml` and `faq.yaml` are **deprecated** — content has moved to `i18n/en.yaml`.

### Client-side JS (`src/js/main.js`)

Eleven modules initialized on DOMContentLoaded:
- **initNav** — Scroll-based sticky nav + mobile hamburger toggle
- **initScrollAnimations** — IntersectionObserver adds `.visible` to `[data-animate]` elements
- **initFAQ** — Accordion toggle on `.faq-question` buttons
- **initProcessTabs** — Buy/Sell tab switching with re-animation
- **initMap** — Leaflet map with custom markers; location cards trigger `flyTo`; data passed via `window.BTM_LOCATIONS`
- **initLocationDetailMap** — Leaflet map on location detail pages
- **initWireframeTilt** — Tilt/parallax effect on wireframe illustration
- **initCurrencyFlow** — Animated currency flow graphic
- **initLocationStatus** — Shows open/closed status based on location hours
- **initLocaleSwitcher** — Language dropdown behaviour
- **initGalleryLightbox** — Lightbox overlay for location photo galleries

### CSS (`src/css/styles.css`)

Brand colors defined as CSS custom properties in `:root`:
- `--accent: #FFE26E` (yellow), `--brand-primary: #374758`, `--brand-link: #268bd2`
- Backgrounds: `--bg-primary: #0f2234`, `--bg-secondary: #142c42`, `--bg-tertiary: #1a3650`

Responsive breakpoints: 768px (tablet), 480px (mobile).

## Translations

All translatable text lives in `src/_data/i18n/en.yaml` (English source of truth).
Each additional locale has a matching file: `src/_data/i18n/ru.yaml` etc.
Supported locales are listed in `src/_data/locales.yaml`.

Templates access translations via `{% set t = i18n[pageLocale] %}` at the top of each template, then `{{ t.ui.some_key }}`.

**When you add new content** (new FAQ, feature, location description, UI string, etc.):
1. Add the English text to `src/_data/i18n/en.yaml`
2. Add the corresponding translation(s) directly to all other locale files (e.g., `src/_data/i18n/ru.yaml`)
3. Run `npm run build` to confirm no missing-key warnings remain

The build validator warns (never errors) if any locale file is missing keys — the site still builds and falls back to English for any missing string.

**Adding a new locale** (e.g. Vietnamese):
1. Add `vi` to `src/_data/locales.yaml`
2. Create `src/_data/i18n/vi.yaml` with all keys from `en.yaml` translated into Vietnamese
3. Run `npm run build` — pages at `/vi/` and `/vi/locations/*/` generate automatically

### Opening hours translation

Each machine in `locations.yaml` has a `hours.display` field (English, e.g. "Every day 10:30 AM – 11:30 PM"). Translated versions live in `i18n/<locale>.yaml` under `locations.regions[i].machines.<slug>.hours_display` (e.g. "매일 10:30 – 23:30").

Hours appear in three places on the home page:
- **Location cards** (`index.njk`) — uses `tMachine.hours_display` with fallback to `machine.hours.display`
- **Map popups** (`main.js`) — uses `window.BTM_HOURS_I18N[slug]` (built per-locale in `index.njk`) with fallback to `h.display`
- **Location detail pages** (`locations.njk`) — uses the merged `hours_display` from the `btmLocationsAll` collection in `.eleventy.js`

When adding a new location, set `hours.display` in `locations.yaml` (English) and `hours_display` in each locale's i18n file for the translated version.

## Adding content

**New BTM location:** Edit `src/_data/locations.yaml` (geo data: slug, lat, lng, address, phone, hours, `photos.src`/`alt`) and `src/_data/i18n/en.yaml` (translatable: region descriptions, machine descriptions, photo captions). Then add the corresponding translations directly to `src/_data/i18n/ru.yaml` (and any other locale files).

**New FAQ item:** Append to `faq.items` in `src/_data/i18n/en.yaml`. Then add the translation directly to all other locale files.

**New feature card:** Create an SVG in `src/_includes/icons/`, reference its filename (without extension) in the `icon` field of `features.yaml`, and add the title and description to `src/_data/i18n/en.yaml` under `features.items`. Then add the translation directly to all other locale files.
