import { createUnifi } from "@ha/unifi-client"
import { Store } from "@reduxjs/toolkit"
import createDebugger from "debug"
import { merge, omit } from "lodash"
import { WithId } from "mongodb"
import allCodes from "./candidateCodes"
import getClient from "./dbClient"
import createStore, { RootState } from "./state"
import { CalendarEvent, fetchEvents } from "./state/event.slice"
import { created } from "./state/lock.slice"

const debug = createDebugger("@ha/guest-pin-codes/app")

const app = async (
  numberOfGuestCodes: number,
  calendarId: string,
): Promise<{ store: Store; start: () => Promise<void> }> => {
  debug("Started")
  const preloadedState: RootState = {
    assignedEvent: {
      assignedEvents: {},
    },
    event: {
      events: {},
    },
    pinCode: {
      codes: allCodes,
    },
    lock: {
      slots: {},
    },
    wifi: {
      guestWifi: {},
    },
  }

  const dbClient = await getClient()
  const persistedEvents = dbClient.db("guests").collection("events")
  const events = await persistedEvents
    .find<WithId<Document> & CalendarEvent>({ calendarId })
    .toArray()
  preloadedState.event.events = events.reduce((acc, event) => {
    acc[`${event.calendarId}_${event.eventId}`] = omit(
      event,
      "_id",
    ) as CalendarEvent
    return acc
  }, {} as Record<string, CalendarEvent>)

  const lockSlots = await dbClient
    .db("guests")
    .collection("slots")
    .find<
      WithId<Document> & {
        id: number
        code: string
        eventId: string
      }
    >({})
    .toArray()
  preloadedState.lock.slots = lockSlots.reduce((acc, slot) => {
    acc[slot.id] = merge({}, slot, { calendarId })
    return acc
  }, {} as Record<string, { code: string; eventId: string; calendarId: string }>)

  const unifi = await createUnifi()
  const wlans: any[] = await unifi.getWLanSettings()
  const guestNetwork = wlans.filter(
    (wlan) => !!wlan.enabled && !!wlan.is_guest && !wlan.name.includes("Temp"),
  )[0]
  if (guestNetwork) {
    preloadedState.wifi.guestWifi = {
      [guestNetwork.name]: guestNetwork.x_passphrase,
    }
  }

  const store = createStore(preloadedState)

  console.log(numberOfGuestCodes, lockSlots.length)
  const lockSlotDiff = numberOfGuestCodes - lockSlots.length
  const remainingLockSlots = lockSlotDiff > 0 ? lockSlotDiff : 0
  debug(`Remaining number of guest slots: ${remainingLockSlots}`)
  store.dispatch(created({ numberOfSlots: remainingLockSlots }))

  return {
    store,
    start: async () => {
      store.dispatch(fetchEvents({ calendarId }))
    },
  }
}

export default app
