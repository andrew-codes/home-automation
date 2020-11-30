jest.mock("fs/promises")
jest.mock("os")
jest.mock("shelljs")
jest.mock("../validate")
jest.mock("../copyUserData")
const fs = require("fs/promises")
const os = require("os")
const path = require("path")
const sh = require("shelljs")
const sut = require("../osxBuildUbuntuImage")
const copyUserData = require("../copyUserData")
const { validateOS, validateIsoPath } = require("../validate")

beforeEach(() => {
  jest.resetAllMocks()
  sh.exec = jest.fn()
})
const tmpRootDir = path.join(__dirname, `..`, `..`, `tmp`)

test(`invalid OS throws exception`, async () => {
  validateOS.mockImplementation(() => {
    throw new Error(`invalid OS.`)
  })
  try {
    await sut(`/my.iso`)
  } catch (e) {
    expect(e.message).toEqual(`invalid OS.`)
  }
})

test(`invalid ISO path throws exception`, async () => {
  validateOS.mockReturnValue()
  validateIsoPath.mockImplementation(() => {
    throw new Error(`invalid ISO.`)
  })
  try {
    await sut(`/my.io`)
  } catch (e) {
    expect(e.message).toEqual(`invalid ISO.`)
  }
})

test(`unzips ISO contents to a temporary directory`, async () => {
  validateOS.mockReturnValue()
  validateIsoPath.mockReturnValue()
  sh.exec.mockReturnValue({
    stdout: `/dev/disk2              Apple_partition_scheme         
/dev/disk2s1            Apple_partition_map            
/dev/disk2s2            Apple_HFS`,
  })
  await sut(`/my.iso`)
  expect(sh.exec.mock.calls[0]).toEqual([
    `mkdir -p ${tmpRootDir}/ubuntu-server`,
  ])
  expect(sh.exec.mock.calls[1]).toEqual([
    `hdiutil attach -imagekey diskimage-class=CRawDiskImage -nobrowse -nomount /my.iso`,
  ])
  expect(sh.exec.mock.calls[2]).toEqual([
    `mount -w -t cd9660 /dev/disk2 ${tmpRootDir}/ubuntu-server`,
  ])
})

test(`creates ISO image with user-data`, async () => {
  validateOS.mockReturnValue()
  validateIsoPath.mockReturnValue()
  sh.exec.mockReturnValue({
    stdout: `/dev/disk2              Apple_partition_scheme         
/dev/disk2s1            Apple_partition_map            
/dev/disk2s2            Apple_HFS`,
  })
  await sut(`/my.iso`)
  expect(sh.exec.mock.calls[3]).toEqual([
    `mkdir -p ${tmpRootDir}/ubuntu-server-output`,
  ])
  expect(copyUserData).toBeCalledWith(`${tmpRootDir}/ubuntu-server-output`)
  expect(sh.exec.mock.calls[4]).toEqual([
    `cp -R ${tmpRootDir}/ubuntu-server/* ${tmpRootDir}/ubuntu-server-output/`,
  ])
  expect(sh.exec.mock.calls[5]).toEqual([
    `hdiutil makehybrid -o ${tmpRootDir}/ubuntu-server-amd64.iso ${tmpRootDir}/ubuntu-server-output -iso -joliet`,
  ])
})

test(`cleanup by detaching ISO directory`, async () => {
  validateOS.mockReturnValue()
  validateIsoPath.mockReturnValue()
  sh.exec.mockReturnValue({
    stdout: `/dev/disk2              Apple_partition_scheme         
/dev/disk2s1            Apple_partition_map            
/dev/disk2s2            Apple_HFS`,
  })
  await sut(`/my.iso`)
  expect(sh.exec.mock.calls[6]).toEqual([
    `rm -rf ${tmpRootDir}/ubuntu-server-output`,
  ])
  expect(sh.exec.mock.calls[7]).toEqual([`hdiutil detach /dev/disk2`])
})

test(`returns path to new ISO image`, async () => {
  validateOS.mockReturnValue()
  validateIsoPath.mockReturnValue()
  sh.exec.mockReturnValue({
    stdout: `/dev/disk2              Apple_partition_scheme         
/dev/disk2s1            Apple_partition_map            
/dev/disk2s2            Apple_HFS`,
  })
  const actual = await sut(`/my.iso`)
  expect(actual).toEqual(`${tmpRootDir}/ubuntu-server-amd64.iso`)
})
