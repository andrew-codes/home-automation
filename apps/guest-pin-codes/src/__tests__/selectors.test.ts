import { getChronologicalEvents } from "../selectors"

test("getting events with no event data in state", () => {
  const actual = getChronologicalEvents(null)
  expect(actual).toEqual([])
})
