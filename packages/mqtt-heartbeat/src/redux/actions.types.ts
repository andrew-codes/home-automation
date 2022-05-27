type PollHeartbeatAction = {
  type: "HEARTBEAT/POLL"
  payload: string
}

type UpdateHomeAssistantAction = {
  type: "HEARTBEAT/UPDATE_HOME_ASSISTANT"
  payload: string
}

type RegisterDeviceWithHomeAssistantAction = {
  type: "HEARTBEAT/REGISTER_DEVICE"
  payload: string
}

export type {
  PollHeartbeatAction,
  UpdateHomeAssistantAction,
  RegisterDeviceWithHomeAssistantAction,
}
