import * as sut from ".."
import delay from "../delay"

test("exports utils", () => {
  expect(sut.delay).toEqual(delay)
})
