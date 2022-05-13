import type {
  DiscoverAction,
  PollDiscoveryAction,
  SetGuestWifiPassPhraseAction,
} from "./types"

const setGuestWifiPassPhrase = (
  homeAssistantId: string,
  passPhrase: string
): SetGuestWifiPassPhraseAction => ({
  payload: { homeAssistantId, passPhrase },
  type: "SET_GUEST_WIFI_PASS_PHRASE",
})

const pollDiscovery = (timeout = 10000): PollDiscoveryAction => ({
  payload: timeout,
  type: "POLL_DISCOVERY",
})

const discover = (): DiscoverAction => ({
  type: "DISCOVER",
})

export { discover, pollDiscovery, setGuestWifiPassPhrase }
