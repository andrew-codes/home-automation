import parseUtcToLocalDate from "../parseUtcToLocalDate"

test("Parses UTC date and time to local date and time", () => {
  const inputDate = "2023-06-30T21:00:00.0000000"
  const inputTimeZone = "Eastern Standard Time"
  const date = parseUtcToLocalDate(inputDate, inputTimeZone)

  expect(date.toISOString()).toBe("2023-06-30T17:00:00.000Z")
})

test("Parsing dates that start at beginning of day", () => {
  const inputDate = "2023-06-30T00:00:00.0000000"
  const inputTimeZone = "Eastern Standard Time"
  const date = parseUtcToLocalDate(inputDate, inputTimeZone)

  expect(date.toISOString()).toBe("2023-06-30T00:00:00.000Z")
})
