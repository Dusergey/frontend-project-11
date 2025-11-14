// postcss.config.cjs
module.exports = {
  plugins: [
    require('postcss-import'),  // Для поддержки импорта в PostCSS
    require('postcss-preset-env')(),
  ],
};
