import { merge } from "lodash"
import { updateEvents } from "../actionCreators"
import reducer, { defaultState } from "../reducer"

test("updating events with no events", () => {
  const actual = reducer(null, updateEvents([]))
  expect(actual.events).toEqual({})
})

test("updating events existing events with event data", () => {
  const state = createState({
    events: {
      "1": {
        summary: "my event",
      },
    },
  })
  const actual = reducer(
    state,
    updateEvents([
      {
        id: "1",
        summary: "my updated event",
      },
    ])
  )

  expect(actual.events).toEqual({
    "1": {
      id: "1",
      summary: "my updated event",
    },
  })
})

function createState({}) {
  return merge({}, defaultState, {})
}
