import * as sut from ".."
import * as utils from "../utils"

test("exports utils", () => {
  expect(sut).toMatchObject(utils)
})
