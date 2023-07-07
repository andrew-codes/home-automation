import { merge } from "lodash"
import { get } from "lodash/fp"
import { createSelector, Selector } from "reselect"
import parseUtcToLocalDate from "./parseUtcToLocalDate"
import type { Slot, State } from "./reducer"

type Entry<X extends string, Y> = [X, Y]
type TransformedSlot = Slot & { start: Date; end: Date }

const toTransformedSlots = (slot: Slot | null): TransformedSlot => {
  return slot
    ? merge({}, slot, {
        start: parseUtcToLocalDate(slot.start, "Eastern Standard Time"),
        end: parseUtcToLocalDate(slot.end, "Eastern Standard Time"),
      })
    : null
}

const getPins: Selector<State, string[]> = (state) => state.pins
const getDoorLocks: Selector<State, string[]> = (state) => state.doorLocks

const getLockSlots: Selector<State, Entry<string, Slot | null>[]> = (state) =>
  Object.entries(state?.guestSlots ?? {}).map(([key, value]) => [
    key,
    toTransformedSlots(value),
  ])

const getAvailableLockSlots: Selector<State, string[]> = createSelector(
  getLockSlots,
  (slots) =>
    (slots.filter(([key, value]) => !value) as [string, Slot][]).map(
      ([key, value]) => key,
    ),
)

const getAlreadyAssignedEventIds = createSelector(getLockSlots, (slots) =>
  slots
    .filter(([key, value]) => !!value)
    .map(get(1))
    .map(get("eventId")),
)

const getGuestWifiNetwork: Selector<
  State,
  { ssid: string; passPhrase: string } | null
> = (state) => state.guestNetwork ?? null

export {
  getPins,
  getAvailableLockSlots,
  getAlreadyAssignedEventIds,
  getLockSlots,
  getGuestWifiNetwork,
}
export type { Entry, TransformedSlot }
