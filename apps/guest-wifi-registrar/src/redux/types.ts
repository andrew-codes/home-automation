type State = {
  guestWifi: Record<
    string,
    {
      id: string
      homeAssistantId: string
      name: string
      passPhrase: string
    }
  >
}

type SetGuestWifiPassPhraseAction = {
  type: "SET_GUEST_WIFI_PASS_PHRASE"
  payload: {
    network: { id: string; name: string }
    homeAssistantId: string
    passPhrase: string
  }
}

type PollDiscoveryAction = {
  type: "POLL_DISCOVERY"
  payload: number
}

type DiscoverAction = {
  type: "DISCOVER"
}

type RegisterWithHomeAssistantAction = {
  type: "REGISTER_WITH_HOME_ASSISTANT"
  payload: {
    id: string
    name: string
    homeAssistantId: string
    passPhrase: string
  }
}

type UpdateHomeAssistantAction = {
  type: "UPDATE_HOME_ASSISTANT"
  payload: {
    homeAssistantId: string
    passPhrase: string
    ssid: string
  }
}

type UpdatePortersAction = {
  type: "UPDATE_PORTERS"
  payload: {
    name: string
    passPhrase: string
  }
}

type AddGuestWifiNetworkAction = {
  type: "ADD_GUEST_WIFI_NETWORK"
  payload: {
    id: string
    name: string
    homeAssistantId: string
    passPhrase: string
  }
}

type AnyAction =
  | AddGuestWifiNetworkAction
  | DiscoverAction
  | PollDiscoveryAction
  | RegisterWithHomeAssistantAction
  | SetGuestWifiPassPhraseAction
  | UpdateHomeAssistantAction
  | UpdatePortersAction

export type {
  AnyAction,
  AddGuestWifiNetworkAction,
  DiscoverAction,
  PollDiscoveryAction,
  RegisterWithHomeAssistantAction,
  SetGuestWifiPassPhraseAction,
  State,
  UpdateHomeAssistantAction,
  UpdatePortersAction,
}
