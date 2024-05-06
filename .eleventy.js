module.exports = function(eleventyConfig) {
  // Copy necessary directories
  eleventyConfig.addPassthroughCopy("_assets");
  eleventyConfig.addPassthroughCopy("_page_blocks");
  eleventyConfig.addPassthroughCopy("_data");

  // Set JavaScript files in _assets/js directory as modules
  eleventyConfig.setBrowserSyncConfig({
    files: ["_assets/js/*.js"], // Adjust the path to match your directory structure
    serveStatic: ["_assets"],
    serveStaticOptions: {
      extensions: ["js"]
    }
  });
};
