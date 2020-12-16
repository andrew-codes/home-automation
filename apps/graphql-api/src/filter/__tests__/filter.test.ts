import sut from "../filter"

test("creating an equality filter", () => {
  const equality = sut("equality")
  expect(equality("id", 1, true)).toEqual({
    type: "equality",
    attribute: "id",
    value: 1,
    negation: true,
  })
})
