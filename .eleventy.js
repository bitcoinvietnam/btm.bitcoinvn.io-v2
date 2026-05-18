const yaml = require("js-yaml");
const CleanCSS = require("clean-css");
const { minify } = require("terser");
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
  const isProduction = process.env.NODE_ENV === "production";
  eleventyConfig.addGlobalData("isProduction", isProduction);

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("src/images");

  // Process CSS through build pipeline (minify in production)
  eleventyConfig.addTemplateFormats("css");
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile(inputContent, inputPath) {
      if (!inputPath.includes("/css/")) return;
      return async () => {
        if (!isProduction) return inputContent;
        const result = new CleanCSS({
          level: {
            1: { all: true },
            2: { all: true },
          },
        }).minify(inputContent);
        if (result.errors?.length) {
          console.error(`[css] CleanCSS errors:`, result.errors);
          return inputContent;
        }
        return result.styles;
      };
    },
  });

  // Process JS through build pipeline (minify in production)
  eleventyConfig.addTemplateFormats("js");
  eleventyConfig.addExtension("js", {
    outputFileExtension: "js",
    compile(inputContent, inputPath) {
      if (!inputPath.includes("/js/")) return;
      return async () => {
        if (!isProduction) return inputContent;
        const result = await minify(inputContent, {
          compress: { passes: 3 },
          mangle: true,
          format: { comments: false },
        });
        return result.code;
      };
    },
  });

  // Nunjucks filter: format numbers with leading zero
  eleventyConfig.addFilter("pad", (num, size) => {
    let s = String(num);
    while (s.length < (size || 2)) s = "0" + s;
    return s;
  });

  eleventyConfig.addFilter("absoluteUrl", (urlPath = "", siteUrl = "") => {
    const base = String(siteUrl || "").replace(/\/+$/, "");
    const pathPart = String(urlPath || "").replace(/^\/+/, "");
    return pathPart ? `${base}/${pathPart}` : `${base}/`;
  });

  eleventyConfig.addFilter("jsonify", (value) => JSON.stringify(value));

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

  function getContentData(collectionApi) {
    const allItems = collectionApi.getAll();
    return {
      baseLocations: allItems.find((i) => i.data.locations)?.data.locations,
      i18nData: allItems.find((i) => i.data.i18n)?.data.i18n || {},
      locales: allItems.find((i) => i.data.locales)?.data.locales || ["en"],
    };
  }

  function getLocaleContext(localeObj, i18nData) {
    const locale = localeObj.code || localeObj;
    return {
      locale,
      localePrefix: localeObj.pathPrefix || "",
      locText: i18nData[locale]?.locations ?? {},
    };
  }

  function mergeMachine(region, tRegion, machine) {
    const tMachine = tRegion.machines?.[machine.slug] ?? {};
    return {
      ...machine,
      regionName: tRegion.name ?? region.name,
      regionSlug: region.slug,
      description: tMachine.description ?? machine.description,
      photos: machine.photos?.map((p, pi) => ({
        ...p,
        caption: tMachine.photos?.[pi]?.caption ?? p.caption,
      })),
      hours: {
        ...machine.hours,
        display: tMachine.hours_display ?? machine.hours.display,
      },
    };
  }

  function mergeRegion(region, ri, locText) {
    const tRegion = locText.regions?.[ri] ?? {};
    return {
      ...region,
      name: tRegion.name ?? region.name,
      description: tRegion.description ?? region.description,
      machines: region.machines.map((machine) => mergeMachine(region, tRegion, machine)),
    };
  }

  // Collections: all BTM location/region × locale combinations, with translated text merged in
  eleventyConfig.addCollection("btmLocationsAll", (collectionApi) => {
    const { baseLocations, i18nData, locales } = getContentData(collectionApi);
    if (!baseLocations) return [];

    return locales.flatMap((localeObj) => {
      const { locale, localePrefix, locText } = getLocaleContext(localeObj, i18nData);
      return baseLocations.regions.flatMap((region, ri) =>
        mergeRegion(region, ri, locText).machines.map((machine) => ({
          locale,
          localePrefix,
          machine,
        }))
      );
    });
  });

  eleventyConfig.addCollection("btmRegionsAll", (collectionApi) => {
    const { baseLocations, i18nData, locales } = getContentData(collectionApi);
    if (!baseLocations) return [];

    return locales.flatMap((localeObj) => {
      const { locale, localePrefix, locText } = getLocaleContext(localeObj, i18nData);
      return baseLocations.regions.map((region, ri) => ({
        locale,
        localePrefix,
        region: mergeRegion(region, ri, locText),
      }));
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
