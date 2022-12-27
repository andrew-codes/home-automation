jest.mock("@ha/mqtt-client")
import { partialMocked } from "@ha/jest-utils"
import { createMqtt } from "@ha/mqtt-client"
import handler from "../registerWithHomeAssistant"

const publish = jest.fn()

beforeEach(async () => {
  jest.resetAllMocks()
  global.fetch = jest.fn()

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
    Buffer.from(
      JSON.stringify({
        areaName: "Game Room",
        areaId: "game_room",
        supportedPlatforms: ["pc", "playstation 5"],
      }),
    ),
  )

  expect(publish.mock.calls[0][0]).toEqual(
    `homeassistant/sensor/game_room_game_media_player_source/config`,
  )
  expect(JSON.parse(publish.mock.calls[0][1].toString())).toEqual(
    expect.objectContaining({
      name: "Game Room Game Media Player Source",
      state_topic: `playnite/game_room/game_media_player/state`,
      value_template: "{{ value_json.id }}",
      optimistic: true,
      entity_category: "diagnostic",
      icon: "mdi:gamepad-square",
      unique_id: `game_room_game_media_player_source`,
      device: {
        name: "Game Room Game Media Player",
        identifiers: ["game_room_game_media_player"],
        suggested_area: "Game Room",
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
      icon: "mdi:gamepad-square",
      unique_id: `game_room_game_media_player_state`,
      device: {
        name: "Game Room Game Media Player",
        identifiers: ["game_room_game_media_player"],
        suggested_area: "Game Room",
      },
    }),
  )

  expect(publish.mock.calls[2][0]).toEqual(
    `homeassistant/sensor/game_room_game_media_player_platform/config`,
  )
  expect(JSON.parse(publish.mock.calls[2][1].toString())).toEqual(
    expect.objectContaining({
      name: "Game Room Game Media Player Platform",
      state_topic: `homeassistant/game_room/game_media_player/state`,
      value_template: "{{ value_json.platformName }}",
      optimistic: true,
      entity_category: "diagnostic",
      icon: "mdi:gamepad-square",
      unique_id: `game_room_game_media_player_platform`,
      device: {
        name: "Game Room Game Media Player",
        identifiers: ["game_room_game_media_player"],
        suggested_area: "Game Room",
      },
    }),
  )

  expect(publish.mock.calls[3][0]).toEqual(
    `homeassistant/sensor/game_room_game_media_player_source_name/config`,
  )
  expect(JSON.parse(publish.mock.calls[3][1].toString())).toEqual(
    expect.objectContaining({
      name: "Game Room Game Media Player Source Name",
      state_topic: `homeassistant/game_room/game_media_player/state`,
      value_template: "{{ value_json.name }}",
      optimistic: true,
      entity_category: "diagnostic",
      icon: "mdi:gamepad-square",
      unique_id: `game_room_game_media_player_source_name`,
      device: {
        name: "Game Room Game Media Player",
        identifiers: ["game_room_game_media_player"],
        suggested_area: "Game Room",
      },
    }),
  )

  expect(publish.mock.calls[4][0]).toEqual(
    `homeassistant/sensor/game_room_game_media_player_platform_id/config`,
  )
  expect(JSON.parse(publish.mock.calls[4][1].toString())).toEqual(
    expect.objectContaining({
      name: "Game Room Game Media Player Platform ID",
      state_topic: `homeassistant/game_room/game_media_player/state`,
      value_template: "{{ value_json.platformId }}",
      optimistic: true,
      entity_category: "diagnostic",
      icon: "mdi:gamepad-square",
      unique_id: `game_room_game_media_player_platform_id`,
      device: {
        name: "Game Room Game Media Player",
        identifiers: ["game_room_game_media_player"],
        suggested_area: "Game Room",
      },
    }),
  )
})
