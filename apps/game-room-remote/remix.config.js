/** @type {import('@remix-run/dev').AppConfig} */
const config = {
  future: {
    v2_routeConvention: true,
  },
  appDirectory: "src",
  assetsBuildDirectory: "dist/public/build",
  ignoredRouteFiles: ["**/.*"],
  publicPath: "/build/",
  serverBuildPath: "dist/index.js",
  serverBuildTarget: "node-cjs",
  serverDependenciesToBundle: [/.*/],
}

module.exports = config
