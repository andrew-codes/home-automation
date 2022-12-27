jest.mock("@ha/mqtt-client")
import { partialMocked } from "@ha/jest-utils"
import { when } from "jest-when"
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
      icon: "mdi:gamepad-sqaure",
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
      icon: "mdi:gamepad-sqaure",
      unique_id: `game_room_game_media_player_state`,
      device: {
        name: "Game Room Game Media Player",
        identifiers: ["game_room_game_media_player"],
        suggested_area: "Game Room",
      },
    }),
  )

  expect(publish.mock.calls[2][0]).toEqual(
    `homeassistant/sensor/game_room_game_media_player_platforms/config`,
  )
  expect(JSON.parse(publish.mock.calls[2][1].toString())).toEqual(
    expect.objectContaining({
      name: "Game Room Game Media Player Platforms",
      state_topic: `homeassistant/game_room/game_media_player/platforms/state`,
      value_template: "{{ value_json }}",
      optimistic: true,
      entity_category: "diagnostic",
      icon: "mdi:gamepad-sqaure",
      unique_id: `game_room_game_media_player_platforms`,
      device: {
        name: "Game Room Game Media Player",
        identifiers: ["game_room_game_media_player"],
        suggested_area: "Game Room",
      },
    }),
  )
})

test("Given a valid topic, when handling the message, then HA is updated with the list of supported platform Ids queried from the Graph", async () => {
  process.env.GRAPH_HOST = "http://graphHost"
  when(fetch)
    .calledWith("http://graphHost", {
      method: "POST",
      body: JSON.stringify({
        query: "query Platforms{ platforms { id name } })",
      }),
      headers: {
        "content-type": "application/json",
      },
    })
    .mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: { platforms: [{ id: "1", name: "Windows (pc)" }] },
      }),
    })
  await handler.handle(
    "homeassistant/game_media_player/state",
    Buffer.from(
      JSON.stringify({
        areaName: "Game Room",
        areaId: "game_room",
        supportedPlatforms: ["Windows (pc)"],
      }),
    ),
  )

  expect(publish.mock.calls[3][0]).toEqual(
    `homeassistant/game_room/game_media_player/platforms/state`,
  )
  expect(JSON.parse(publish.mock.calls[3][1].toString())).toEqual(
    expect.arrayContaining(["1"]),
  )
})

test("Given a valid topic and a payload with some platforms that are not known to the Graph, when handling the message, then HA is updated with the known platforms and omit any unknown ones.", async () => {
  process.env.GRAPH_HOST = "http://graphHost"
  when(fetch)
    .calledWith("http://graphHost", {
      method: "POST",
      body: JSON.stringify({
        query: "query Platforms{ platforms { id name } })",
      }),
      headers: {
        "content-type": "application/json",
      },
    })
    .mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: { platforms: [{ id: "1", name: "Playstation 5" }] },
      }),
    })
  await handler.handle(
    "homeassistant/game_media_player/state",
    Buffer.from(
      JSON.stringify({
        areaName: "Game Room",
        areaId: "game_room",
        supportedPlatforms: ["Windows (pc)"],
      }),
    ),
  )

  expect(publish.mock.calls[3][0]).toEqual(
    `homeassistant/game_room/game_media_player/platforms/state`,
  )
  expect(JSON.parse(publish.mock.calls[3][1].toString())).toEqual(
    expect.arrayContaining([]),
  )
})
