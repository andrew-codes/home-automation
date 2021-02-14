const { defaults } = require("jest-config")

module.exports = {
  ...defaults,
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  collectCoverageFrom: [
    "**/src/**/*.{js,ts}",
    "!**/__tests__/*.*",
    "!node_modules/**",
    "!**/node_modules/**",
  ],
}
