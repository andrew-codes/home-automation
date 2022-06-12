const sh = require("shelljs")
const {
  validateIsoPath,
  validateMediaPath,
  validateOS,
  validateRootUser,
} = require("./validate")

const image = async (mediaPath, isoPath) => {
  validateOS("darwin")
  validateRootUser()
  await validateMediaPath(mediaPath)
  await validateIsoPath(isoPath)

  sh.exec(`diskutil eraseDisk FAT32 INSTALL ${mediaPath};`, { silent: true })
  sh.exec(`diskutil unmountDisk ${mediaPath};`, { silent: true })
  sh.exec(`dd if=${isoPath} of=${mediaPath};`, { silent: true })
  sh.exec(`diskutil eject ${mediaPath};`, { silent: true })
}

module.exports = image
