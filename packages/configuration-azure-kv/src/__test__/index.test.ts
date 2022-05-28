import { Configuration, configurationApi } from "../"

describe("configuration api module exports", () => {
  test("Creates a configuration API capable of getting configuration values.", async () => {
    const value = await configurationApi.get("")
    expect(value).toEqual(30526)
  })
})
