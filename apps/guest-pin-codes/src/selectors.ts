import { get } from "lodash/fp"
import { createSelector, Selector } from "reselect"
import type { Slot, State } from "./reducer"

type Entry<X extends string, Y> = [X, Y]

const getCodes: Selector<State, string[]> = (state) => state.pins
const getDoorLocks: Selector<State, string[]> = (state) => state.doorLocks

const getLockSlots: Selector<State, Entry<string, Slot | null>[]> = (state) =>
  Object.entries(state?.guestSlots ?? {})

const getAvailableLockSlots = createSelector(getLockSlots, (slots) =>
  slots.filter(([key, value]) => !value).map(get(0)),
)

const getAlreadyAssignedEventIds = createSelector(getLockSlots, (slots) =>
  slots
    .filter(([key, value]) => !!value)
    .map(get(1))
    .map(get("eventId")),
)

const getGuestWifiNetwork: Selector<
  State,
  { ssid: string; password: string } | null
> = (state) => state.guestNetwork ?? null

export {
  getCodes as getPins,
  getAvailableLockSlots,
  getAlreadyAssignedEventIds,
  getLockSlots,
  getGuestWifiNetwork,
}
export type { Entry }
