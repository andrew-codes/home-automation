jest.mock("fs/promises")
jest.mock("os")
jest.mock("shelljs")
const fs = require("fs/promises")
const os = require("os")
const sh = require("shelljs")
const sut = require("../validate")

sh.exec = jest.fn()

beforeEach(() => {
  jest.resetAllMocks()
})

describe("validateIsoPath", () => {
  test("isoPath that does not exist on disk throws an exception", async () => {
    fs.access.mockResolvedValue()
    fs.access.mockRejectedValue(
      "ENOENT: no such file or directory, access '/does-not-exist/image.iso'"
    )
    try {
      await sut.validateIsoPath("/invalid-ISO-Path.iso")
    } catch (e) {
      expect(e).toEqual(
        "ENOENT: no such file or directory, access '/does-not-exist/image.iso'"
      )
    }
  })

  test("existing isoPath to a non `.iso` file throws an exception", async () => {
    fs.access.mockResolvedValue()
    fs.access.mockResolvedValue()
    try {
      await sut.validateIsoPath("/invalid-ISO-Path")
    } catch (e) {
      expect(e.message).toEqual("`isoPath` must be a path to an .iso file.")
    }
  })
})

describe("validateOS", () => {
  test("non-matching platform throw an error", async () => {
    os.platform.mockReturnValue("windows")
    try {
      await sut.validateOS("darwin")
    } catch (e) {
      expect(e.message).toEqual("Only darwin platform is supported.")
    }
  })
})

describe("validateMediaPath", () => {
  test("throws error when mediaPath does not exist on disk or is not writeable", async () => {
    fs.access.mockRejectedValue(
      "ENOENT: no such file or directory, access '/not-found'"
    )
    try {
      sut.validateMediaPath("/not-found")
    } catch (e) {
      expect(e.message).toEqual(
        "ENOENT: no such file or directory, access '/not-found'"
      )
    }
  })
})

describe("validateHostname", () => {
  test("throws error when not hostname is provided", async () => {
    try {
      sut.validateHostname()
    } catch (e) {
      expect(e.message).toEqual("`hostname` is required.")
    }
  })

  test("throws error when not hostname is invalid", async () => {
    try {
      sut.validateHostname("not a valid hostname")
    } catch (e) {
      expect(e.message).toEqual("`hostname` must be a valid network hostname.")
    }
  })
})
