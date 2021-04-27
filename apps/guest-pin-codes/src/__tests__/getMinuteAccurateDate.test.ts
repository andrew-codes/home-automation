import getMinuteAccurateDate from "../getMinuteAccurateDate"

test("returns the date with a timestamp of the last whole minute", () => {
  const input = new Date(2021, 0, 1, 0, 1, 10)
  const expected = new Date(2021, 0, 1, 0, 1, 0, 0)

  expect(getMinuteAccurateDate(input)).toEqual(expected)
})
