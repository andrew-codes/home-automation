jest.mock("@ha/mqtt-client")
import { partialMocked } from "@ha/jest-utils"
import { createMqtt } from "@ha/mqtt-client"
import handler from "../registerWithHomeAssistant"

const publish = jest.fn()

beforeEach(async () => {
  jest.resetAllMocks()

  partialMocked(createMqtt).mockResolvedValue({ publish })
})

test("Handler reacts to area registration topic", () => {
  expect(handler.shouldHandle(`homeassistant/game_media_player/state`)).toEqual(
    true,
  )
  expect(handler.shouldHandle(`playnite/library/game/state`)).toEqual(false)
})

test("Given a valid topic, when handling the message, then HA is queried and each text marker entity's value (area name and ID JSON) will be used to register a gaming media player in HA via MQTT", async () => {
  await handler.handle(
    "homeassistant/game_media_player/state",
    Buffer.from(JSON.stringify({ areaName: "Game Room", areaId: "game_room" })),
  )

  expect(publish.mock.calls[0][0]).toEqual(
    `homeassistant/text/game_room_game_media_player_source/config`,
  )
  expect(JSON.parse(publish.mock.calls[0][1].toString())).toEqual(
    expect.objectContaining({
      name: "Game Room Game Media Player Source",
      command_topic: `playnite/game_room/game_media_player/source/cmd`,
      state_topic: `playnite/game_room/game_media_player/state`,
      value_template: "{{ value_json.id }}",
      optimistic: true,
      entity_category: "diagnostic",
      // icon: "mdi:sony-playstation",
      unique_id: `game_room_game_media_player_source`,
      device: {
        name: "Game Room Game Media Player",
        identifiers: ["game_room_game_media_player"],
        suggested_area: "game_room",
      },
    }),
  )

  expect(publish.mock.calls[1][0]).toEqual(
    `homeassistant/sensor/game_room_game_media_player_state/config`,
  )
  expect(JSON.parse(publish.mock.calls[1][1].toString())).toEqual(
    expect.objectContaining({
      name: "Game Room Game Media Player State",
      state_topic: `playnite/game_room/game_media_player/state`,
      value_template: "{{ value_json.state }}",
      optimistic: true,
      entity_category: "diagnostic",
      // icon: "mdi:sony-playstation",
      unique_id: `game_room_game_media_player_state`,
      device: {
        name: "Game Room Game Media Player",
        identifiers: ["game_room_game_media_player"],
        suggested_area: "game_room",
      },
    }),
  )
})
