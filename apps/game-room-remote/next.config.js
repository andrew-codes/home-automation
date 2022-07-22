const path = require("path")

module.exports = {
  distDir: "dist",
  webpack: (config, { webpack, isServer }) => {
    config.module.rules.push({
      test: /\.ts$/,
      include: [path.join(__dirname, "..", "..", "packages")],
      use: "ts-loader",
    })
    return config
  },
}
