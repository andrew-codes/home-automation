const fs = require("fs").promises
const fsConstants = require("fs").constants
const path = require("path")
const shell = require("shelljs")

const validateOS = (platform) => {
  if (platform !== "darwin") {
    throw new Error("Only darwin platform is supported.")
  }
}

const validateMediaPath = async (mediaPath = "") => {
  await fs.access(mediaPath, fsConstants.F_OK | fsConstants.W_OK)
}

const image = async (mediaPath, { cpuArc, platform, hostname }) => {
  validateOS(platform)
  await validateMediaPath(mediaPath)
}

module.export = image
