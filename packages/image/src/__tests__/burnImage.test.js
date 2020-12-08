jest.mock("shelljs")
jest.mock("../validate")
const sh = require("shelljs")
const sut = require("../burnImage")
const {
  validateOS,
  validateRootUser,
  validateMediaPath,
} = require("../validate")

beforeEach(() => {
  jest.resetAllMocks()
  sh.exec = jest.fn()
})

test("throws error on invalid platforms (non-darwin)", async () => {
  validateOS.mockImplementation(() => {
    throw new Error("not root user")
  })
  try {
    await sut("/found", "/image.iso")
  } catch (e) {
    expect(e.message).toEqual("not root user")
  }
})

test("throws error non-root user", async () => {
  validateRootUser.mockImplementation(() => {
    throw new Error("invalid platform")
  })
  try {
    await sut("/found", "/image.iso")
  } catch (e) {
    expect(e.message).toEqual("invalid platform")
  }
})

test("invalid mediaPath path throws an exception", async () => {
  validateMediaPath.mockImplementation(() => {
    throw new Error("mediaPath not found or not writeable")
  })
  try {
    await sut("/nope", "/invalid-ISO-Path.io")
  } catch (e) {
    expect(e.message).toEqual("mediaPath not found or not writeable")
  }
})

test("invalid image path throws an exception", async () => {
  validateMediaPath.mockImplementation(() => {
    throw new Error("image not found or not writeable")
  })
  try {
    await sut("/nope", "/invalid-ISO-Path.io")
  } catch (e) {
    expect(e.message).toEqual("image not found or not writeable")
  }
})

test("erases disk and formats to FAT32 at provided mediaPath", async () => {
  await sut("/found", "/ubuntu-server.iso")
  expect(sh.exec.mock.calls[0]).toEqual([
    "diskutil eraseDisk FAT32 INSTALL /found",
  ])
})

test("burns provided image to the drive at mediaPath", async () => {
  await sut("/found", "/ubuntu-server.iso")
  expect(sh.exec.mock.calls[1]).toEqual(["diskutil unmountDisk /found"])
  expect(sh.exec.mock.calls[2]).toEqual(["dd if=/ubuntu-server.iso of=/found"])
})

test("ejects drive when complete", async () => {
  await sut("/found", "/ubuntu-server.iso")
  expect(sh.exec.mock.calls[3]).toEqual(["diskutil eject /found"])
})
