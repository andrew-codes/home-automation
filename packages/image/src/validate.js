const fs = require("fs/promises")
const fsConstants = require("fs").constants
const os = require("os")
const sh = require("shelljs")

const validateIsoPath = async (isoPath = "") => {
  await fs.access(isoPath, fsConstants.F_OK | fsConstants.R_OK)
}

const validateOS = (targetPlatform) => {
  const platform = os.platform()

  if (platform !== targetPlatform) {
    throw new Error("Only darwin platform is supported.")
  }
}

const validateRootUser = () => {
  if (sh.exec('echo "$EUID";', { silent: true }).stdout.trimEnd("\n") !== "0") {
    throw new Error("Must run as root user.")
  }
}

const validateMediaPath = async (mediaPath = "") => {
  await fs.access(mediaPath, fsConstants.F_OK | fsConstants.W_OK)
}

const validateHostname = (hostname) => {
  if (!hostname || hostname === "") {
    throw new Error("`hostname` is required.")
  }
  if (hostname.includes(" ")) {
    throw new Error("`hostname` must be a valid network hostname.")
  }
}

module.exports.validateIsoPath = validateIsoPath
module.exports.validateOS = validateOS
module.exports.validateRootUser = validateRootUser
module.exports.validateMediaPath = validateMediaPath
module.exports.validateHostname = validateHostname
