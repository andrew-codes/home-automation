jest.mock("shelljs", () => ({
  exec: jest.fn(),
}))
import path from "path"
import sh from "shelljs"
import { when } from "jest-when"
import jsonnet from "../jsonnet"

describe("jsonnet", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    jest.mocked(sh.exec).mockReturnValue({ stderr: "", stdout: "", code: 0 })
  })

  describe("eval", () => {
    const jsonnetPath = `testing/test.jsonnet`

    test("eval takes a string of jsonnet, provides it to the jsonnet CLI and returns the result.", async () => {
      when(sh.exec)
        .calledWith(
          `jsonnet -J ${path.join(
            __dirname,
            "..",
            "..",
            "..",
            "..",
            "vendor",
          )} ${jsonnetPath};`,
          { silent: true },
        )
        .mockReturnValue({ stderr: "", stdout: "output", code: 0 })

      const actual = await jsonnet.eval(jsonnetPath)
      expect(actual).toEqual("output")
    })

    test("Values may be provided to be passed as extStr variables to the jsonnet CLI", async () => {
      await jsonnet.eval(jsonnetPath, {
        TEST_1: `test "value"`,
        TEST_2: `some value with
new lines`,
        TEST_3: 80,
      })

      expect(sh.exec).toBeCalledTimes(1)
      expect(sh.exec).toBeCalledWith(
        expect.stringMatching(/ --ext-str 'TEST_1="test \\\"value\\\""'/),
        { silent: true },
      )
      expect(sh.exec).toBeCalledWith(
        expect.stringMatching(
          / --ext-str 'TEST_2="some value with\\nnew lines"'/,
        ),
        { silent: true },
      )
      expect(sh.exec).toBeCalledWith(
        expect.stringMatching(/ --ext-str 'TEST_3=80'/),
        { silent: true },
      )
    })
  })
})
