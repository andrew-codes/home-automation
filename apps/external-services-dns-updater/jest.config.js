const configure = require("@ha/configure-jest")

module.exports = configure({
  transformIgnorePatterns: ["node_modules/(?!uuid)"],
  moduleNameMapper: {
    uuid: require.resolve("uuid"),
  },
})
