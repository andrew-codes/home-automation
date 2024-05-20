const { defaults } = require("jest-config")
const { merge } = require("lodash")

const defaultConfig = {
  transform: {
    "^.+\\.(j|t)sx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
        useESM: true,
      },
    ],
  },
  resetMocks: true,
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  passWithNoTests: true,
  coverageDirectory: "<rootDir>/.test-runs/unit",
  collectCoverage: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  collectCoverageFrom: ["**/src/**", "**/scripts/**"],
  coveragePathIgnorePatterns: ["/__tests__/", "/__mocks__/"],
}

const configure = (overrides = {}) =>
  merge({}, defaults, defaultConfig, overrides)

module.exports = configure
