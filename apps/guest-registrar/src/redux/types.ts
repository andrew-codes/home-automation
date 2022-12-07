type State = {}

type AddGuestAction = {
  type: "ADD_GUEST"
  payload: {
    mac: string
  }
}

type UpdateHomeAssistantWithGuestsAction = {
  type: "UPDATE_HOME_ASSISTANT_WITH_GUESTS"
}

type AnyAction = AddGuestAction | UpdateHomeAssistantWithGuestsAction

export type {
  AnyAction,
  AddGuestAction,
  State,
  UpdateHomeAssistantWithGuestsAction,
}
