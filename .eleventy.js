const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  // Convert root-relative URLs to relative paths so the build works at any mount point
  eleventyConfig.addTransform("relative-urls", function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
      return content;
    }
    const depth = (this.page.url.match(/\//g) || []).length - 1;
    const prefix = depth === 0 ? "./" : "../".repeat(depth);
    return content.replace(/((?:href|src|action)=")\/(?!\/)/g, `$1${prefix}`);
  });

  // YAML data file support
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));

  // Expose NODE_ENV to templates
  eleventyConfig.addGlobalData("isProduction", process.env.NODE_ENV === "production");

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");

  // Nunjucks filter: format numbers with leading zero
  eleventyConfig.addFilter("pad", (num, size) => {
    let s = String(num);
    while (s.length < (size || 2)) s = "0" + s;
    return s;
  });

  // Build validator: warn about missing translation keys
  eleventyConfig.on("eleventy.before", async () => {
    const i18nDir = path.resolve(__dirname, "src/_data/i18n");
    const localesFile = path.resolve(__dirname, "src/_data/locales.yaml");

    if (!fs.existsSync(localesFile) || !fs.existsSync(i18nDir)) return;

    const locales = yaml.load(fs.readFileSync(localesFile, "utf8")) || [];
    const sourceLocale = "en";
    const enFile = path.join(i18nDir, `${sourceLocale}.yaml`);
    if (!fs.existsSync(enFile)) return;

    const enData = yaml.load(fs.readFileSync(enFile, "utf8")) || {};

    function countLeafStrings(obj) {
      if (obj === null || obj === undefined) return 0;
      if (typeof obj === "string") return 1;
      if (Array.isArray(obj)) return obj.reduce((s, v) => s + countLeafStrings(v), 0);
      if (typeof obj === "object") return Object.values(obj).reduce((s, v) => s + countLeafStrings(v), 0);
      return 0;
    }

    function countMissing(en, ru) {
      if (en === null || en === undefined) return 0;
      if (typeof en === "string") {
        return (ru === undefined || ru === null || ru === "") ? 1 : 0;
      }
      if (Array.isArray(en)) {
        return en.reduce((s, item, i) => {
          const ruItem = Array.isArray(ru) ? ru[i] : undefined;
          return s + countMissing(item, ruItem);
        }, 0);
      }
      if (typeof en === "object") {
        return Object.keys(en).reduce((s, key) => {
          const ruVal = ru && typeof ru === "object" && !Array.isArray(ru) ? ru[key] : undefined;
          return s + countMissing(en[key], ruVal);
        }, 0);
      }
      return 0;
    }

    for (const localeObj of locales) {
      const code = localeObj.code || localeObj;
      if (code === sourceLocale) continue;
      const localeFile = path.join(i18nDir, `${code}.yaml`);
      if (!fs.existsSync(localeFile)) {
        const total = countLeafStrings(enData);
        console.warn(`[i18n] ${total} untranslated keys for locale '${code}' (file missing). Create src/_data/i18n/${code}.yaml`);
        continue;
      }
      const localeData = yaml.load(fs.readFileSync(localeFile, "utf8")) || {};
      const missing = countMissing(enData, localeData);
      if (missing > 0) {
        console.warn(`[i18n] ${missing} missing ${code} translation key${missing === 1 ? "" : "s"}. Edit src/_data/i18n/${code}.yaml`);
      }
    }
  });

  // Collection: all BTM location × locale combinations, with translated text merged in
  eleventyConfig.addCollection("btmLocationsAll", (collectionApi) => {
    const allItems = collectionApi.getAll();

    const baseLocations = allItems.find((i) => i.data.locations)?.data.locations;
    if (!baseLocations) return [];

    const i18nData = allItems.find((i) => i.data.i18n)?.data.i18n || {};
    const locales = allItems.find((i) => i.data.locales)?.data.locales || ["en"];

    return locales.flatMap((localeObj) => {
      const locale = localeObj.code || localeObj;
      const localePrefix = localeObj.pathPrefix || "";
      const locText = i18nData[locale]?.locations ?? {};

      return baseLocations.regions.flatMap((region, ri) => {
        const tRegion = locText.regions?.[ri] ?? {};

        return region.machines.map((machine) => {
          const tMachine = tRegion.machines?.[machine.slug] ?? {};

          return {
            locale,
            localePrefix,
            machine: {
              ...machine,
              regionName: tRegion.name ?? region.name,
              description: tMachine.description ?? machine.description,
              photos: machine.photos?.map((p, pi) => ({
                ...p,
                caption: tMachine.photos?.[pi]?.caption ?? p.caption,
              })),
              hours: {
                ...machine.hours,
                display: tMachine.hours_display ?? machine.hours.display,
              },
            },
          };
        });
      });
    });
  });

  return {
    pathPrefix: process.env.PATHPREFIX || "/",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
  };
};
