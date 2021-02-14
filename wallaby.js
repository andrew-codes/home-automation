const path = require("path")
const glob = require("glob")
const { flatten } = require("lodash")
const lernaConfig = require("./lerna.json")

const packageDirectories = flatten(
  lernaConfig.packages.map((pkgGlob) => glob.sync(pkgGlob))
)
const packageNodeModuleDirectories = packageDirectories.map(
  (pkgDir) => `${pkgDir}/node_modules`
)

const srcFiles = flatten(
  packageDirectories.map((pkgDir) => [
    `${pkgDir}/src/**/*.ts`,
    `${pkgDir}/src/*.ts`,
    `${pkgDir}/src/**/*.js`,
    `${pkgDir}/src/*.js`,
  ])
)
const tests = flatten(
  packageDirectories.map((pkgDir) => [
    `${pkgDir}/src/**/__tests__/*.ts`,
    `${pkgDir}/src/__tests__/*.ts`,
    `${pkgDir}/src/**/__tests__/*.js`,
    `${pkgDir}/src/__tests__/*.js`,
  ])
)
console.log(srcFiles)
module.exports = function (wallaby) {
  process.env.NODE_PATH +=
    path.delimiter + packageNodeModuleDirectories.join(path.delimiter)

  return {
    debug: true,
    trace: true,
    files: ["jest.config.js"]
      .concat(srcFiles)
      .concat(["!**/bin/*.*", "!**/__tests__/*.*"]),
    tests,
    testFramework: "jest",
    env: {
      type: "node",
    },
    setup: (w) => {
      const jestConfig = require("./jest.config")
      w.testFramework.configure(jestConfig)
    },
  }
}
