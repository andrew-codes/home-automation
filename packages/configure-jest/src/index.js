const { defaults } = require("jest-config")
const { merge } = require("lodash")

const defaultConfig = {
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.test.json",
    },
  },
  resetMocks: true,
  passWithNoTests: true,
  coverageDirectory: "<rootDir>/.test-runs/unit",
  collectCoverage: true,
  preset: "ts-jest",
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{js,ts}",
    "<rootDir>/scripts/**/*.{js,ts}",
  ],
  coveragePathIgnorePatterns: ["/__tests__/", "/node_modules/", "/__mocks__/"],
  transformIgnorePatterns: ["node_modules/(?!uuid)"],
  moduleNameMapper: {
    uuid: require.resolve("uuid"),
  },
}

const configure = (overrides = {}) =>
  merge({}, defaults, defaultConfig, overrides)

module.exports = configure
