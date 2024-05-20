type State = {
  macs: string[]
}

type AddGuestAction = {
  type: "ADD_GUEST"
  payload: {
    mac: string
  }
}

type UpdateHomeAssistantWithGuestsAction = {
  type: "UPDATE_HOME_ASSISTANT_WITH_GUESTS"
}

type UpdateMacsAction = {
  type: "UPDATE_MACS"
  payload: string[]
}

type AnyAction =
  | AddGuestAction
  | UpdateHomeAssistantWithGuestsAction
  | UpdateMacsAction

export type {
  AnyAction,
  AddGuestAction,
  State,
  UpdateHomeAssistantWithGuestsAction,
  UpdateMacsAction,
}
