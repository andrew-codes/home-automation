import { safeCliString, safeCliStringWitDoubleQuotes } from "../utils"

describe("cli utils", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe("safeCliString", () => {
    test("CLI safe string properly handles double quotes and new lines", () => {
      const input = `{
        "person"
      }`
      const expected = '{\\n        \\"person\\"\\n      }'
      const actual = safeCliString(input)

      expect(actual).toEqual(expected)
    })
  })

  describe("safeCliStringWithDoubleQuotes", () => {
    test("Safely handles double quotes", () => {
      const input = `{
        person1: {
            name: "Alice",
            welcome: "Hello " + self.name + "!",
        },
        person2: self.person1 { name: "Bob" },
    }`
      const expected = `{
        person1: {
            name: \\"Alice\\",
            welcome: \\"Hello \\" + self.name + \\"!\\",
        },
        person2: self.person1 { name: \\"Bob\\" },
    }`
      const actual = safeCliStringWitDoubleQuotes(input)

      expect(actual).toEqual(expected)
    })
  })
})
