import { merge } from "lodash"
import { defaultState } from "../reducer"
import { getGuestWifiNetwork } from "../selectors"

test("getting guest network information", () => {
  const actual = getGuestWifiNetwork(
    merge({}, defaultState, {
      guestNetwork: {
        ssid: "test",
        passPhrase: "testing",
      },
    }),
  )

  expect(actual).toEqual({
    ssid: "test",
    passPhrase: "testing",
  })
})
