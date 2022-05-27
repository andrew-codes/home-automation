import { toEntityId, toFriendlyName } from ".."

describe("toEntityId", () => {
  test("All uppercase transforms to all lowercase", () => {
    const actual = toEntityId("ALL_CAPS")
    expect(actual).toEqual("all_caps")
  })

  test("Spaces become snake case", () => {
    const actual = toEntityId("ALL CAPS")
    expect(actual).toEqual("all_caps")
  })

  test("Dashes become snake case", () => {
    const actual = toEntityId("ALL-CAPS")
    expect(actual).toEqual("all_caps")
  })

  test("camelCase converts to snake case", () => {
    const actual = toEntityId("ALL-CAPS")
    expect(actual).toEqual("all_caps")
  })

  test("Sentence case converts to snake case", () => {
    const actual = toEntityId("All caps")
    expect(actual).toEqual("all_caps")
  })

  test("pascal case converts to snake case", () => {
    const actual = toEntityId("AllCaps")
    expect(actual).toEqual("all_caps")
  })
})

describe("toFriendlyName", () => {
  test("ALl uppercase become start case", () => {
    const actual = toFriendlyName("ALL CAPS")
    expect(actual).toEqual("All Caps")
  })

  test("Spaces become start case", () => {
    const actual = toFriendlyName("ALL CAPS")
    expect(actual).toEqual("All Caps")
  })

  test("Dashes become start case", () => {
    const actual = toFriendlyName("ALL-CAPS")
    expect(actual).toEqual("All Caps")
  })

  test("camelCase converts to start case", () => {
    const actual = toFriendlyName("ALL-CAPS")
    expect(actual).toEqual("All Caps")
  })

  test("Sentence case converts to start case", () => {
    const actual = toFriendlyName("All caps")
    expect(actual).toEqual("All Caps")
  })

  test("pascal case converts to start case", () => {
    const actual = toFriendlyName("AllCaps")
    expect(actual).toEqual("All Caps")
  })
})
