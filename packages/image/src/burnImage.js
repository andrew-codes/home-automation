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

  sh.exec(`diskutil eraseDisk FAT32 INSTALL ${mediaPath}`)
  sh.exec(`diskutil unmountDisk ${mediaPath}`)
  sh.exec(`dd if=${isoPath} of=${mediaPath}`)
  sh.exec(`diskutil eject ${mediaPath}`)
}

module.exports = image
