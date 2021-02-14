const path = require("path")
const { defaults } = require("jest-config")

module.exports = {
  ...defaults,
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  transform: {
    "^.+\\.[jt]sx?$": path.join(__dirname, "babel-jest-transformer.js"),
  },
  reporters: ["default", "jest-github-reporter"],
}
