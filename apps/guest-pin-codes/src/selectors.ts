import { createSelector, Selector } from "reselect"
import type { CalendarEvent, Slot, State } from "./reducer"

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

const getNextPin = createSelector(getAvailablePins, (pins) => pins[0])

const getLockSlots: Selector<State, Slot[]> = (state) =>
  Object.values(state.guestSlots).filter((slot) => !!slot) as Slot[]

const getCandidateSlots = createSelector(
  getLockSlots,
  getEvents,
  (slots, events) => {
    const now = new Date().getTime()
    return slots.filter((slot) => {
      if (slot.eventId === null) {
        return true
      }

      const event = events.find(
        (event) =>
          event.eventId === slot.eventId &&
          event.calendarId === slot.calendarId,
      )
      if (!event) {
        return true
      }

      const eventEnd = new Date(event.end).getTime()
      return now > eventEnd
    })
  },
)

const getGuestWifiNetwork: Selector<
  State,
  { ssid: string; passPhrase: string } | null
> = (state) => state.guestNetwork ?? null

export { getNextPin, getEvents, getCandidateSlots, getGuestWifiNetwork }
export type { Entry }
