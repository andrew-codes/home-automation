type State = {
  guestWifi: Record<
    string,
    {
      passPhrase: string | null
    }
  >
}

type SetGuestWifiPassPhraseAction = {
  type: "SET_GUEST_WIFI_PASS_PHRASE"
  payload: { homeAssistantId: string; passPhrase: string }
}

type PollDiscoveryAction = {
  type: "POLL_DISCOVERY"
  payload: number
}

type DiscoverAction = {
  type: "DISCOVER"
}

type RegisterWithHomeAssistantAction = {
  type: "REGISTER_DEVICE"
  payload: {
    id: string
  }
}

type AnyAction =
  | DiscoverAction
  | PollDiscoveryAction
  | SetGuestWifiPassPhraseAction

export type {
  AnyAction,
  DiscoverAction,
  PollDiscoveryAction,
  SetGuestWifiPassPhraseAction,
  State,
}
