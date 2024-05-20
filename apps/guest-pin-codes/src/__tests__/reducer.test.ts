import { merge } from "lodash"
import {
  createGuestSlots,
  setGuestWifiNetworkInformation,
  setPinsInPool,
} from "../actionCreators"
import reducer, { defaultState, State } from "../reducer"

test("set the guest slots by a contiguous block", () => {
  const state = createState()
  const actual = reducer(state, createGuestSlots(5))
  expect(actual.guestSlots).toEqual({
    "1": null,
    "2": null,
    "3": null,
    "4": null,
    "5": null,
  })
})

test("setting PIN codes to pool", () => {
  const state = createState({
    codes: ["1"],
  })
  const actual = reducer(state, setPinsInPool(["2", "3"]))
  expect(actual.pins).toEqual(["2", "3"])
})

test("setting guest wifi network information", () => {
  const state = createState()
  const actual = reducer(
    state,
    setGuestWifiNetworkInformation("test", "testing"),
  )
  expect(actual.guestNetwork).toEqual({
    ssid: "test",
    passPhrase: "testing",
  })
})

function createState(state = {}): State {
  return merge({}, defaultState, state)
}
