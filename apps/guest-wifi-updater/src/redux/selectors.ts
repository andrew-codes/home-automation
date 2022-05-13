import { State } from "./types"
import { createSelector } from "reselect"

const getNetworkDictionary = (state: State) => state.guestWifi

const getNetworks = createSelector(getNetworkDictionary, (networkDictionary) =>
  Object.values(networkDictionary)
)

export { getNetworkDictionary, getNetworks }
