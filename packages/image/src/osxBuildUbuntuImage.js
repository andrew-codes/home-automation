const fs = require("fs/promises")
const path = require("path")
const sh = require("shelljs")
const copyUserData = require("./copyUserData")
const { validateIsoPath, validateOS, validateRootUser } = require("./validate")

const osxBuildUbuntuImage = async (
  isoPath,
  data = {},
  targetPlatform = "amd64"
) => {
  validateOS("darwin")
  validateRootUser()
  await validateIsoPath(isoPath)

  const tmpRootDirPath = path.join(__dirname, "..", "tmp")
  sh.exec(`mkdir -p ${tmpRootDirPath}`)

  // const outputImgPath = path.join(tmpRootDirPath, "ubuntu")
  // sh.exec(`hdiutil convert -format UDRW -o ${outputImgPath} ${isoPath}`)

  const attachOutput = sh.exec(`hdiutil attach -nobrowse -nomount ${isoPath}`)
  const disk = attachOutput.stdout.split(" ")[0]

  const ubuntuImgFSPath = path.join(tmpRootDirPath, "ubuntu")
  sh.exec(`mkdir -p ${ubuntuImgFSPath}`)
  sh.exec(`mount -t cd9660 ${disk} ${ubuntuImgFSPath}`)

  const tmpOutputDirPath = path.join(tmpRootDirPath, "ubuntu-output")
  sh.exec(`mkdir -p ${tmpOutputDirPath}`)
  await copyUserData(tmpOutputDirPath, data)
  sh.exec(`cp -a ${ubuntuImgFSPath}/. ${tmpOutputDirPath}/`)

  const outputPath = path.join(tmpRootDirPath, `ubuntu-${targetPlatform}.iso`)
  // sh.exec(`hdiutil makehybrid -o ${tmpIsoPath} ${tmpOutputDirPath} -iso -udf`)

  // const outputPath = path.join(tmpRootDirPath, `ubuntu-${targetPlatform}.iso`)
  // sh.exec(`hdiutil convert ${tmpIsoPath} -format UDTO -o ${outputPath}`)

  sh.exec(
    `mkisofs -lRJ -V "Ubuntu Server Custom" -b isolinux/isolinux.bin -c isolinux/boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table -o ${outputPath} ${tmpOutputDirPath}`
  )
  sh.exec(`perl ${path.join(__dirname, "makeBootable.pl")} ${outputPath}`)
  sh.exec(`diskutil unmountDisk force ${disk}`)
  sh.exec(`hdiutil detach -force ${disk}`)
  sh.exec(`rm -rf ${tmpOutputDirPath}`)
  return outputPath
}

module.exports = osxBuildUbuntuImage
// mkisofs -udf -relaxed-filenames -joliet-long -no-emul-boot -b isolinux/isolinux.bin -c isolinux/boot.cat -boot-load-size 4 -boot-info-table -no-emul-boot -eltorito-alt-boot -o tmp/ubuntu-amd64.new.iso tmp/ubuntu-output
