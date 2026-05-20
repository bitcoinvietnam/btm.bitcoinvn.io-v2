# Agent Instructions

This is the BitcoinVN BTM static marketing site. It uses Eleventy 3, Nunjucks templates, YAML data, and vanilla CSS/JS. See `README.md` for developer setup and broader project documentation.

## Commands

- `npm run dev` - start the Eleventy dev server with hot reload
- `npm run build` - production build to `_site/`
- `npm run clean` - remove `_site/`

Run `npm run build` after template, data, asset pipeline, or translation changes.

## Current Shape

- Source lives in `src/`; build output lives in `_site/`.
- Main templates: `src/index.njk`, `src/host.njk`, `src/locations.njk`, `src/city.njk`.
- Shared layout and partials live in `src/_includes/`.
- Site data lives in `src/_data/*.yaml`.
- Translations live in `src/_data/i18n/*.yaml`.
- Images under `src/images/` are copied through by Eleventy.
- CSS and JS are processed by `.eleventy.js` and minified in production.

Current locales are defined in `src/_data/locales.yaml`: `en`, `ru`, `ko`, `ja`, `zh`, `de`, `fr`, `es`, and `pt-br`.

## Editing Rules

- Keep content data-driven. Prefer editing YAML data over hardcoding copy in templates.
- For translatable text, update `src/_data/i18n/en.yaml` and every active locale file with real translations.
- For locations, put shared operational data in `src/_data/locations.yaml`; put translated descriptions, captions, and `hours_display` overrides in locale files.
- Do not use `src/_data/howItWorks.yaml` or `src/_data/faq.yaml` for new content. Those files are legacy; current content lives in locale files.
- Keep changes scoped. Do not reformat unrelated templates, generated `_site` files, lockfiles, or user work.

## Template Notes

- Templates paginating over `locales` receive a full locale object; access translations with `i18n[pageLocale.code]`.
- Location detail pages use merged collection items; access translations with `i18n[item.locale]`.
- `.eleventy.js` builds localized location and region collections and warns about missing translation keys during builds.

## Before Finishing

- Run `npm run build` when the change can affect generated output.
- Check build output for `[i18n]` warnings and fix missing translations when relevant.
- Summarize changed files and any verification performed.
