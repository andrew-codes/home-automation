jest.mock("fs/promises")
jest.mock("handlebars")
const fs = require("fs/promises")
const Handlebars = require("handlebars")
const path = require("path")
const sut = require("../copyUserData")

beforeEach(() => {
  jest.resetAllMocks()
})

test("populates user-data.yml and copies as a file to target directory", async () => {
  fs.readFile.mockResolvedValue("hello")
  const templateFn = jest.fn()
  Handlebars.compile.mockReturnValue(templateFn)
  templateFn.mockReturnValue("hello hostname")

  await sut("/tmp/ubuntu-server", { hostname: "hostname" })
  expect(fs.readFile).toBeCalledWith(
    path.join(__dirname, "../user-data.yml"),
    "utf8"
  )
  expect(templateFn).toBeCalledWith({ hostname: "hostname" })
  expect(fs.writeFile).toBeCalledWith(
    "/tmp/ubuntu-server/user-data.yml",
    "hello hostname",
    "utf8"
  )
})
