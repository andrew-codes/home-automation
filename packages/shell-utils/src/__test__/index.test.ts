import { throwIfError } from ".."

describe("throw if process error", () => {
  test("Throw is child process exits with an error.", () => {
    expect(() =>
      throwIfError({ stdout: "", stderr: "an error", code: 1 }),
    ).toThrow("an error")
  })

  test("Does not throw when child process does not exit with an error.", () => {
    expect(() =>
      throwIfError({ stdout: "", stderr: "", code: 0 }),
    ).not.toThrow()
  })
})
