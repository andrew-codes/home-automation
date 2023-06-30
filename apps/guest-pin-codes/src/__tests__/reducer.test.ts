import { merge } from "lodash"
import {
  setCodesInPool,
  setGuestSlots,
  setGuestWifiNetworkInformation,
} from "../actionCreators"
import reducer, { defaultState, State } from "../reducer"

const tomorrow = new Date()
tomorrow.setDate(new Date().getDate() + 1)
const nextWeek = new Date()
nextWeek.setDate(new Date().getDate() + 7)
const nextMonth = new Date()
nextMonth.setDate(new Date().getDate() + 28)
const yesterday = new Date()
yesterday.setDate(new Date().getDate() - 1)

test("set the guest slots by a contiguous block starting at an offset index", () => {
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

test("setting PIN codes to pool", () => {
  const state = createState({
    codes: ["1"],
  })
  const actual = reducer(state, setCodesInPool(["2", "3"]))
  expect(actual.codes).toEqual(["2", "3"])
})

test("setting guest wifi network information", () => {
  const state = createState()
  const actual = reducer(
    state,
    setGuestWifiNetworkInformation("test", "testing"),
  )
  expect(actual.guestNetwork).toEqual({
    ssid: "test",
    password: "testing",
  })
})

function createState(state = {}): State {
  return merge({}, defaultState, state)
}

let id = 0
function createEvent(event = {}) {
  return merge({ summary: "a summary", end: {}, start: {} }, event, {
    id: (id++).toString(),
  })
}
