# CLAUDE.md / CODEX.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BitcoinVN BTM marketing site — a single-page static website for Bitcoin ATM locations in Vietnam. Built with Eleventy (11ty) 3.x, Nunjucks templates, and YAML-driven content.

## Commands

- `npm run dev` — Start dev server with hot reload (typically localhost:8080 or 8081)
- `npm run build` — Build static site to `_site/`
- `npm run clean` — Remove `_site/` output directory

## Architecture

**Data-driven single-page site.** All content lives in YAML files (`src/_data/`), templates just render it.

```
src/_data/*.yaml → Nunjucks templates → _site/index.html
```

### Key files

- `.eleventy.js` — Config: YAML data extension via js-yaml, passthrough copy for css/js/images, custom `pad` filter
- `src/index.njk` — The entire page (nav, hero, features, locations, how-it-works, FAQ, contact, footer)
- `src/_includes/base.njk` — HTML shell (head, external deps, body wrapper)
- `src/_includes/icons/*.svg` — SVG icon partials included by name from `features.yaml` icon field

### Data files

| File | Purpose | Template access |
|------|---------|-----------------|
| `site.yaml` | Brand info, contact links, notice banner toggle | `{{ site.name }}`, `{{ site.contact.telegram.url }}` |
| `locations.yaml` | BTM locations with lat/lng + Leaflet map config | `{% for region in locations.regions %}` |
| `features.yaml` | 10 feature cards with icon references | `{% for feature in features.items %}` |
| `howItWorks.yaml` | Buy/sell step-by-step instructions | `{% for step in howItWorks.buy %}` |
| `faq.yaml` | FAQ items (answers may contain raw HTML links) | `{{ item.answer \| safe }}` |

### Client-side JS (`src/js/main.js`)

Five modules initialized on DOMContentLoaded:
- **initNav** — Scroll-based sticky nav + mobile hamburger toggle
- **initScrollAnimations** — IntersectionObserver adds `.visible` to `[data-animate]` elements
- **initFAQ** — Accordion toggle on `.faq-question` buttons
- **initProcessTabs** — Buy/Sell tab switching with re-animation
- **initMap** — Leaflet map with custom markers; location cards trigger `flyTo`; data passed via `window.BTM_LOCATIONS`

### CSS (`src/css/styles.css`)

Brand colors defined as CSS custom properties in `:root`:
- `--accent: #FFE26E` (yellow), `--brand-primary: #374758`, `--brand-link: #268bd2`
- Backgrounds: `--bg-primary: #0f2234`, `--bg-secondary: #142c42`, `--bg-tertiary: #1a3650`

Responsive breakpoints: 768px (tablet), 480px (mobile).

## Adding content

To add a new BTM location, edit `src/_data/locations.yaml` — add a machine entry with `name`, `district`, `lat`, `lng`, `mapsUrl`. The map and location cards update automatically.

To add a new FAQ, append to `src/_data/faq.yaml`. HTML in answers is rendered via the `| safe` filter.

To add a new feature icon, create an SVG in `src/_includes/icons/` and reference its filename (without extension) in the `icon` field of `features.yaml`.
