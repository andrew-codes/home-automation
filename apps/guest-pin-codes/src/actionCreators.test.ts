import { scheduleEvents } from "./actionCreators"

test("scheduling events is to precision of minutes", () => {
  const timestamp = new Date(2021, 1, 1, 1, 1, 35, 0)
  const actual = scheduleEvents(timestamp)
  expect(actual.payload).toEqual(new Date(2021, 1, 1, 1, 1, 0, 0))
})
