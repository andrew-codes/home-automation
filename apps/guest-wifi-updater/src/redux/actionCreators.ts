import type {
  AddGuestWifiNetworkAction,
  DiscoverAction,
  PollDiscoveryAction,
  RegisterWithHomeAssistantAction,
  SetGuestWifiPassPhraseAction,
  UpdateHomeAssistantAction,
} from "./types"

const setGuestWifiPassPhrase = (
  id: string,
  homeAssistantId: string,
  passPhrase: string
): SetGuestWifiPassPhraseAction => ({
  payload: { id, homeAssistantId, passPhrase },
  type: "SET_GUEST_WIFI_PASS_PHRASE",
})

const pollDiscovery = (timeout = 10000): PollDiscoveryAction => ({
  payload: timeout,
  type: "POLL_DISCOVERY",
})

const discover = (): DiscoverAction => ({
  type: "DISCOVER",
})

const registerWithHomeAssistant = (
  id: string,
  name: string,
  passPhrase: string
): RegisterWithHomeAssistantAction => ({
  type: "REGISTER_WITH_HOME_ASSISTANT",
  payload: {
    id: id,
    name,
    homeAssistantId: `guest_wifi_${name.replace(/-/g, "_").toLowerCase()}`,
    passPhrase,
  },
})

const updateHomeAssistant = (
  name: string,
  passPhrase: string
): UpdateHomeAssistantAction => ({
  type: "UPDATE_HOME_ASSISTANT",
  payload: {
    homeAssistantId: `guest_wifi_${name.replace(/-/g, "_").toLowerCase()}`,
    passPhrase,
  },
})

const addGuestWifiNetwork = (
  id: string,
  name: string,
  homeAssistantId: string,
  passPhrase: string
): AddGuestWifiNetworkAction => ({
  type: "ADD_GUEST_WIFI_NETWORK",
  payload: {
    id,
    name,
    homeAssistantId,
    passPhrase,
  },
})

export {
  addGuestWifiNetwork,
  discover,
  pollDiscovery,
  registerWithHomeAssistant,
  setGuestWifiPassPhrase,
  updateHomeAssistant,
}
