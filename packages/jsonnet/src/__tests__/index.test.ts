import * as sut from ".."
import jsonnet from "../jsonnet"

test("exports eval", () => {
  expect(sut.jsonnet).toMatchObject(jsonnet)
})
