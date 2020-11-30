jest.mock("fs/promises")
jest.mock("shelljs")
const fs = require("fs/promises")
const sh = require("shelljs")
const image = require("../image")

beforeEach(() => {
  jest.resetAllMocks()
  sh.exec = jest.fn()
})

describe("invalid paramters", () => {
  test("invalid ISO path throws an exception", async () => {
    try {
      await image("/nope", { hostname: "my-host" }, "/invalid-ISO-Path.io")
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  test("hostname is required", async () => {
    fs.access.mockResolvedValue()
    fs.access.mockResolvedValue()
    try {
      await image("/found", {}, "/ubuntu-server.iso")
    } catch (e) {
      expect(e.message).toEqual("`hostname` is required.")
    }

    try {
      await image("/found", { hostname: "" }, "/ubuntu-server.iso")
    } catch (e) {
      expect(e.message).toEqual("`hostname` is required.")
    }
  })

  test("invalid hostname throws an exception", async () => {
    fs.access.mockResolvedValue()
    fs.access.mockResolvedValue()
    try {
      await image("/found", { hostname: "my host name" }, "/ubuntu-server.iso")
    } catch (e) {
      expect(e.message).toEqual("`hostname` must be a valid network hostname.")
    }
  })
})

test("erases disk and formats to FAT32 at provided mediaPath", async () => {
  fs.access.mockResolvedValue()
  fs.access.mockResolvedValue()
  await image("/found", { hostname: "my-host-name" }, "/ubuntu-server.iso")
  expect(sh.exec.mock.calls[0]).toEqual([
    "diskutil eraseDisk FAT32 UBUNTUSERV /found",
  ])
})

test("burns provided ISO image to the drive at mediaPath", async () => {
  fs.access.mockResolvedValue()
  fs.access.mockResolvedValue()
  await image("/found", { hostname: "my-host-name" }, "/ubuntu-server.iso")
  expect(sh.exec.mock.calls[1]).toEqual([
    "sudo yarn etcher /ubuntu-server.iso --drive /found -y",
  ])
})

test("ejects drive when complete", async () => {
  fs.access.mockResolvedValue()
  fs.access.mockResolvedValue()
  await image("/found", { hostname: "my-host-name" }, "/ubuntu-server.iso")
  expect(sh.exec.mock.calls[2]).toEqual(["diskutil eject /found"])
})
