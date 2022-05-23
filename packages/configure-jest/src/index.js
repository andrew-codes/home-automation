const { defaults } = require("jest-config")
const { merge } = require("lodash")

const defaultConfig = {
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.test.json",
    },
  },
  coverageDirectory: "<rootDir>/.test-runs/unit",
  collectCoverage: true,
  preset: "ts-jest",
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"],
  collectCoverageFrom: ["**/src/**/*.{js,ts}"],
  coveragePathIgnorePatterns: ["/__tests__/", "/node_modules/"],
  reporters: ["default", "jest-github-reporter"],
}

const configure = (overrides = {}) =>
  merge({}, defaults, defaultConfig, overrides)

module.exports = configure
