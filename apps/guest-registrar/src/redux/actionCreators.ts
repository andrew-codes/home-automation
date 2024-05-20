import type {
  AddGuestAction,
  UpdateHomeAssistantWithGuestsAction,
  UpdateMacsAction,
} from "./types"

const addGuest = (mac: string): AddGuestAction => ({
  payload: { mac },
  type: "ADD_GUEST",
})

const updateHomeAssistantWithGuests =
  (): UpdateHomeAssistantWithGuestsAction => ({
    type: "UPDATE_HOME_ASSISTANT_WITH_GUESTS",
  })

const updateMacs = (macs: string[]): UpdateMacsAction => ({
  type: "UPDATE_MACS",
  payload: macs,
})

export { addGuest, updateHomeAssistantWithGuests, updateMacs }
