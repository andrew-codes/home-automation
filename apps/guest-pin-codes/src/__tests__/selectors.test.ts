import { merge } from "lodash"
import { defaultState } from "../reducer"
import { getChronologicalEvents } from "../selectors"

test("getting events with no event data in state", () => {
  const actual = getChronologicalEvents(null)
  expect(actual).toEqual([])
})

test("getting events in chronological order", () => {
  const actual = getChronologicalEvents(
    merge({}, defaultState, {
      events: {
        "1": {
          id: "1",
        },
        "2": {
          id: "2",
        },
      },
      eventOrder: ["2", "1"],
    })
  )
  expect(actual).toEqual([
    {
      id: "2",
    },
    {
      id: "1",
    },
  ])
})
