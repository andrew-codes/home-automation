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
    jest.mocked(sh.exec).mockReturnValue({ stderr: "", stdout: "" })
  })
  describe("eval", () => {
    const jsonnetContent = `{
        person1: {
            name: "Alice",
            welcome: "Hello " + self.name + "!",
        },
        person2: self.person1 { name: "Bob" },
    }`
    const cliJsonnetContent = `{
        person1: {
            name: \"Alice\",
            welcome: \"Hello \" + self.name + \"!\",
        },
        person2: self.person1 { name: \"Bob\" },
    }`

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
          )} $(echo -n "${cliJsonnetContent}" | tr '\\n' ' ')`,
        )
        .mockReturnValue({ stderr: "", stdout: "output" })

      const actual = await jsonnet.eval(jsonnetContent)
      expect(actual).toEqual("output")
    })

    test("Values may be provided to be passed as extStr variables to the jsonnet CLI", async () => {
      await jsonnet.eval(jsonnetContent, {
        TEST_1: `test "value"`,
        TEST_2: `some value with
new lines`,
        TEST_3: 80,
      })

      expect(sh.exec).toBeCalledTimes(1)
      expect(sh.exec).toBeCalledWith(
        expect.stringMatching(
          / --ext-str "TEST_1=\$\(echo -n "test \\"value\\""\)"/,
        ),
      )
      expect(sh.exec).toBeCalledWith(
        expect.stringMatching(
          / --ext-str "TEST_2=\$\(echo -n "some value with\\nnew lines"\)"/,
        ),
      )
      expect(sh.exec).toBeCalledWith(
        expect.stringMatching(/ --ext-str "TEST_3=80"/),
      )
    })
  })
})
