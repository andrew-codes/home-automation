import createDebugger from "debug"
import {
  PollHeartbeatAction,
  RegisterDeviceWithHomeAssistantAction,
  UpdateHomeAssistantAction,
} from "./actions.types"

const debug = createDebugger("@ha/mqtt-heartbeat/action")

const registerWithHomeAssistant = (
  serviceName: string,
): RegisterDeviceWithHomeAssistantAction => {
  debug("register action", serviceName)

  return {
    type: "HEARTBEAT/REGISTER_DEVICE",
    payload: serviceName,
  }
}

const poll = (serviceName: string): PollHeartbeatAction => ({
  type: "HEARTBEAT/POLL",
  payload: serviceName,
})

const updateHomeAssistant = (
  serviceName: string,
): UpdateHomeAssistantAction => ({
  type: "HEARTBEAT/UPDATE_HOME_ASSISTANT",
  payload: serviceName,
})

export { poll, registerWithHomeAssistant, updateHomeAssistant }
