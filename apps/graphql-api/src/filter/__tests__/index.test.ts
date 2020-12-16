import { equality } from "../index"

test("equality filter creator", () => {
  expect(equality("id", 1, true)).toEqual({
    type: "equality",
    attribute: "id",
    value: 1,
    negation: true,
  })
})
