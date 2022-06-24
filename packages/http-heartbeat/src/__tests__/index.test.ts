import * as sut from "../"
import createHeartbeat from "../heartbeat"

describe("http heartbeat package", () => {
  test("exports function to create heartbeat", () => {
    expect(sut.createHeartbeat).toEqual(createHeartbeat)
  })
})
