import { throwIfError } from ".."

describe("throw if process error", () => {
  test("Throw is child process exits with an error.", async () => {
    await expect(
      throwIfError({ stdout: "", stderr: "an error", code: 1 }),
    ).rejects.toEqual(new Error("an error"))
  })

  test("Does not throw when child process does not exit with an error.", async () => {
    await expect(
      throwIfError({ stdout: "good", stderr: "", code: 0 }),
    ).resolves.toEqual("good")
  })

  test("Returns stdout when no error is thrown.", async () => {
    await expect(
      throwIfError({ stdout: "hello", stderr: "", code: 0 }),
    ).resolves.toEqual("hello")
  })
})
