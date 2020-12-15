const { defaults } = require("jest-config")

module.exports = {
  ...defaults,
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  transform: {
    "^.+\\.jsx?$": "<rootDir>/babelJest.js",
    "^.+\\.tsx?$": "<rootDir>/babelJest.js",
  },
}
