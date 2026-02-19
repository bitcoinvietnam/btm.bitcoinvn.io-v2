const yaml = require("js-yaml");

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

  // Collection: flatten all BTM locations into a single array
  eleventyConfig.addCollection("btmLocations", (collectionApi) => {
    const locations = collectionApi.getAll().find(
      (item) => item.data.locations
    )?.data.locations;

    if (!locations) return [];

    const machines = [];
    for (const region of locations.regions) {
      for (const machine of region.machines) {
        machines.push({ ...machine, regionName: region.name });
      }
    }
    return machines;
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
