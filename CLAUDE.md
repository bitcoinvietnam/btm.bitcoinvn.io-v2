# Project Instructions

## Overview

BitcoinVN BTM marketing site — static site for Bitcoin ATM locations in Vietnam. Eleventy 3.x, Nunjucks templates, YAML-driven content. Generates home + location detail pages per locale.

## Commands

- `npm run dev` — Dev server with hot reload
- `npm run build` — Build to `_site/`
- `npm run clean` — Remove `_site/`

## Architecture

Data-driven multi-locale site: `src/_data/*.yaml` + `src/_data/i18n/*.yaml` → Nunjucks → `_site/`

Generated pages (per locale — English at `/`, Russian at `/ru/`):
- Home pages from `src/index.njk`
- Location detail pages from `src/locations.njk` (paginated over `collections.btmLocationsAll`)

### Key files

- `.eleventy.js` — Config: YAML data, passthrough copy, `pad` filter, `relative-url` transform, missing-key build validator
- `src/index.njk` — Home page (nav, hero, features, locations, how-it-works, FAQ, contact, footer)
- `src/locations.njk` — Location detail template (one page per locale × location)
- `src/_includes/base.njk` — HTML shell
- `src/_includes/locale-switcher.njk` — Language switcher dropdown
- `src/_includes/icons/*.svg` — SVG partials referenced by `features.yaml` icon field

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

`howItWorks.yaml` and `faq.yaml` are deprecated — content moved to `i18n/en.yaml`.

## Translations

All translatable text lives in `src/_data/i18n/en.yaml`. Each locale has a matching file (e.g. `ru.yaml`). Locales listed in `src/_data/locales.yaml`.

Templates: `{% set t = i18n[pageLocale] %}` then `{{ t.ui.some_key }}`.

**When adding any new content** (FAQ, feature, location, UI string, etc.):
1. Add English text to `en.yaml`
2. Add **actual translations** to all other locale files
3. `npm run build` to verify — validator warns on missing keys, falls back to English

**Do NOT paste English text as a placeholder in non-English locale files.** Every locale file must contain properly translated text in its target language. Copying English content verbatim into `ru.yaml`, `ko.yaml`, `ja.yaml`, or `zh.yaml` is not acceptable — translate it.

### Opening hours

`locations.yaml` has `hours.display` (English). Translated hours go in `i18n/<locale>.yaml` under `locations.regions[i].machines.<slug>.hours_display`.

## Adding content

**New location:** Add geo data to `locations.yaml` (slug, lat, lng, address, phone, hours, photos). Add translatable text (descriptions, captions) to `en.yaml` + all locale files.

**New FAQ:** Append to `faq.items` in `en.yaml` + all locale files.

**New feature card:** Create SVG in `src/_includes/icons/`, reference in `features.yaml`, add title/description to `en.yaml` + all locale files.
