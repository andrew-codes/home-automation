const { defaults } = require("jest-config")
const { merge } = require("lodash")

const defaultConfig = {
  transform: {
    "^.+\\.(j|t)s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
        useESM: true,
      },
    ],
  },
  resetMocks: true,
  passWithNoTests: true,
  coverageDirectory: "<rootDir>/.test-runs/unit",
  collectCoverage: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"],
  collectCoverageFrom: ["**/src/**/*.{js,ts}", "**/scripts/**/*.{js,ts}"],
  coveragePathIgnorePatterns: ["/__tests__/", "/__mocks__/"],
}

const configure = (overrides = {}) =>
  merge({}, defaults, defaultConfig, overrides)

module.exports = configure
