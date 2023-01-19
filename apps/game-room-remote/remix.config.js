const { getDependenciesToBundle } = require("@remix-run/dev")

/** @type {import('@remix-run/dev').AppConfig} */
const config = {
  appDirectory: "src",
  assetsBuildDirectory: "dist/public/build",
  ignoredRouteFiles: ["**/.*"],
  publicPath: "/build/",
  serverBuildPath: "dist/index.js",
  serverBuildTarget: "node-cjs",
  serverDependenciesToBundle: [
    /^@ha\/.*/,
    ...getDependenciesToBundle("swiper"),
    // ...getDependenciesToBundle("swiper/react"),
  ],
}

module.exports = config
