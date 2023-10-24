import { createSelector, Selector } from "reselect"
import type { CalendarEvent, Slot, State } from "./reducer"

type Entry<X extends string, Y> = [X, Y]

const getEvents: Selector<State, CalendarEvent[]> = (state) => {
  return Object.values(state.events)
}

const getPins: Selector<State, string[]> = (state) => state.pins

const getAvailablePins = createSelector(
  getPins,
  getEvents,
  (pins, calendarEvents) =>
    pins.filter(
      (pin) =>
        !calendarEvents.some((calendarEvent) => calendarEvent.pin === pin),
    ),
)

const getNextPin = createSelector(getAvailablePins, (pins) => pins[0])

const getLockSlots: Selector<State, Slot[]> = (state) =>
  Object.values(state.guestSlots).filter((slot) => !!slot) as Slot[]

const getGuestWifiNetwork: Selector<
  State,
  { ssid: string; passPhrase: string } | null
> = (state) => state.guestNetwork ?? null

export { getNextPin, getEvents, getLockSlots, getGuestWifiNetwork }
export type { Entry }
