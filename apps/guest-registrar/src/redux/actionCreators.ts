import type {
  AddGuestAction,
  UpdateHomeAssistantWithGuestsAction,
} from "./types"

const addGuest = (mac: string): AddGuestAction => ({
  payload: { mac },
  type: "ADD_GUEST",
})

const updateHomeAssistantWithGuests =
  (): UpdateHomeAssistantWithGuestsAction => ({
    type: "UPDATE_HOME_ASSISTANT_WITH_GUESTS",
  })

export { addGuest, updateHomeAssistantWithGuests }
