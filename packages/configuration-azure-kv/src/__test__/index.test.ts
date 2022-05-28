import { staticConfiguration } from "../"

describe("configuration api module exports", () => {
  test("Creates a configuration API capable of getting configuration values.", async () => {
    const value = await staticConfiguration.get("externalAlexaSkillPort")
    expect(value).toEqual(30526)
  })
})
