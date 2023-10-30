import { createSelector, Selector } from "reselect"
import type { CalendarEvent, State } from "./reducer"

type Entry<X extends string, Y> = [X, Y]

const getEvents: Selector<State, CalendarEvent[]> = (state) => {
  return Object.values(state.events).sort((a, b) => {
    const aStart = new Date(a.start).getTime()
    const bStart = new Date(b.start).getTime()

    return aStart - bStart
  })
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

const getLockSlots: Selector<State, Record<string, string | null>> = (state) =>
  state.guestSlots

const getOpenSlots = createSelector(
  getLockSlots,
  getEvents,
  (slots, events) => {
    return Object.entries(slots).filter(([slotId, eventId]) => {
      if (eventId === null) {
        return true
      }

      return !events.some((event) => event.eventId === eventId)
    })
  },
)

const getGuestWifiNetwork: Selector<
  State,
  { ssid: string; passPhrase: string } | null
> = (state) => state.guestNetwork ?? null

export { getAvailablePins, getEvents, getOpenSlots, getGuestWifiNetwork }
export type { Entry }
