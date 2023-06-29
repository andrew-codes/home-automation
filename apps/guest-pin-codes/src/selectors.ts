import { get } from "lodash/fp"
import { createSelector, Selector } from "reselect"
import { State } from "./reducer"

type Entry<X extends string, Y> = [X, Y]

const getCodes: Selector<State, string[]> = (state) => state.codes
const getDoorLocks: Selector<State, string[]> = (state) => state.doorLocks

const getLockSlots: Selector<State, Entry<string, string>[]> = (state) =>
  Object.entries(state?.guestSlots ?? {})

const getAvailableLockSlots = createSelector(getLockSlots, (slots) =>
  slots.filter(([key, value]) => !value).map(get(0)),
)

const getGuestWifiNetwork: Selector<
  State,
  { ssid: string; password: string } | null
> = (state) => state.guestNetwork ?? null

export {
  getAvailableLockSlots,
  getCodes,
  getDoorLocks,
  getGuestWifiNetwork,
  getLockSlots,
}
