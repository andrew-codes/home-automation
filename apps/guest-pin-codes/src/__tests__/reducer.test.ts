import { merge } from "lodash"
import {
  addCodesToPool,
  addDoorLocks,
  setGuestSlots,
  updateEvents,
} from "../actionCreators"
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

test("set the guest slots by a continguous block starting at an offset index", () => {
  const state = createState()
  const actual = reducer(state, setGuestSlots(5, 2))
  expect(actual.guestSlots).toEqual({
    "2": null,
    "3": null,
    "4": null,
    "5": null,
    "6": null,
  })
})

test("adding PIN codes to pool and maintains their order", () => {
  const state = createState({
    codes: ["1"],
  })
  const actual = reducer(state, addCodesToPool(["2", "3"]))
  expect(actual.codes).toEqual(["1", "2", "3"])
})

test("adding doors that with locks", () => {
  const state = createState({ doorLocks: ["front_door"] })
  const actual = reducer(state, addDoorLocks(["car_port_door", "back_door"]))
  expect(actual.doorLocks).toEqual(["front_door", "car_port_door", "back_door"])
})

function createState(state = {}) {
  return merge({}, defaultState, state)
}
