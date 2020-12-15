module.exports = (api) => {
  api.cache(true)
  return {
    babelrcRoots: [".", "apps/*", "packages/*"],
    presets: [
      ["@babel/preset-env", { targets: { node: "current" } }],
      "@babel/preset-typescript",
    ],
    ignore: ["node_modules"],
  }
}
