import { throwIfError } from ".."

describe("throw if process error", () => {
  test("Throw is child process contains a stderr", () => {
    expect(() => throwIfError({ stdout: "", stderr: "an error" })).toThrow(
      "an error",
    )
  })

  test("Does not throw is child process contains an empty stderr.", () => {
    expect(() => throwIfError({ stdout: "", stderr: "" })).not.toThrow()
  })
})
