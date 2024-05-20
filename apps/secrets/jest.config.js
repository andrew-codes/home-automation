const configure = require("@ha/configure-jest")

module.exports = configure({
  collectCoverageFrom: ["<rootDir>/scripts/**/*.{js,ts}"],
})
