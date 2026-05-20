# BitcoinVN BTM Site

Static marketing site for BitcoinVN BTM locations in Vietnam. The site is built with Eleventy 3, Nunjucks templates, YAML data files, and a small vanilla CSS/JS pipeline.

## Quick Start

```sh
npm install
npm run dev
```

The dev server runs Eleventy with hot reload. For a production build:

```sh
npm run build
```

Generated files are written to `_site/`. To remove the build output:

```sh
npm run clean
```

## Project Structure

```text
src/
  index.njk                 Home page, generated once per locale
  host.njk                  Host-a-BTM landing page, generated once per locale
  locations.njk             Location detail page, generated once per locale/location
  city.njk                  Region/city page template
  sitemap.xml.njk           Sitemap template
  robots.txt.njk            Robots template
  _includes/                Shared Nunjucks layouts, partials, and SVG icons
  _data/                    Site, location, locale, feature, and translation data
  css/styles.css            Main stylesheet
  js/                       Client-side JavaScript
  images/                   Static images copied through to the build
```

Eleventy reads `src/_data/*.yaml` and `src/_data/i18n/*.yaml`, merges translated location content in `.eleventy.js`, and writes static pages into `_site/`.

## Important Files

| File | Purpose |
| --- | --- |
| `.eleventy.js` | Eleventy config, YAML loader, collections, filters, asset processing, and translation warnings |
| `src/_data/site.yaml` | Site metadata, contact links, notice toggle, supported assets |
| `src/_data/locales.yaml` | Supported locales and URL prefixes |
| `src/_data/locations.yaml` | Non-translatable location data such as slugs, addresses, coordinates, hours, and photos |
| `src/_data/features.yaml` | Feature card icon references |
| `src/_data/i18n/en.yaml` | English source text |
| `src/_data/i18n/*.yaml` | Per-locale translations |

## Locales

Locales are configured in `src/_data/locales.yaml`. The current locale set is:

- `en` at `/`
- `ru` at `/ru/`
- `ko` at `/ko/`
- `ja` at `/ja/`
- `zh` at `/zh/`
- `de` at `/de/`
- `fr` at `/fr/`
- `es` at `/es/`
- `pt-br` at `/pt-br/`

Templates that paginate over `locales` receive a full locale object, so use `pageLocale.code` to access translated strings:

```njk
{% set t = i18n[pageLocale.code] %}
```

The location detail template paginates over merged collection items, so it uses:

```njk
{% set t = i18n[item.locale] %}
```

## Editing Content

### Add or Update a Location

1. Edit `src/_data/locations.yaml` for shared location data: slug, region, lat/lng, address, phone, opening hours, maps URL, website, and photo paths.
2. Add translated location copy in each relevant `src/_data/i18n/<locale>.yaml` file under `locations.regions`.
3. Run `npm run build` and check for translation warnings.

Location hours use English display text in `locations.yaml`. Locale-specific display overrides belong in the translation files as `hours_display`.

### Add a Translatable String

1. Add the English source string to `src/_data/i18n/en.yaml`.
2. Add real translations to each locale file in `src/_data/i18n/`.
3. Run `npm run build`.

The build warns about missing translation keys but does not fail. Missing strings fall back in templates where fallback logic exists, so warnings should still be treated as work to fix.

### Add a Feature Card

1. Add or reuse an SVG icon in `src/_includes/icons/`.
2. Reference the icon in `src/_data/features.yaml`.
3. Add the feature title and description in each `src/_data/i18n/<locale>.yaml`.

## Build Notes

- `NODE_ENV=production npm run build` behavior is already wrapped by `npm run build`.
- Production builds minify CSS with CleanCSS and JavaScript with terser.
- Images under `src/images` are copied directly to `_site/images`.
- Root-relative `href`, `src`, and `action` URLs are transformed to relative URLs so the static output can work from different mount points.
- `PATHPREFIX` can be used to set Eleventy's path prefix when needed.

## Deprecated Data Files

`src/_data/howItWorks.yaml` and `src/_data/faq.yaml` are legacy files. Current how-it-works and FAQ content lives in each locale file under `how_it_works` and `faq.items`.

## Before Opening a PR

```sh
npm run build
```

Review any `[i18n]` warnings in the build output and update translation files where needed.
