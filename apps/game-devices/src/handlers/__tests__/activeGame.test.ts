jest.mock("@ha/mqtt-client")
import { partialMocked } from "@ha/jest-utils"
import { createMqtt } from "@ha/mqtt-client"
import { when } from "jest-when"
import handler from "../activeGame"

const validTopic = "playnite/library/game/state"
const publish = jest.fn()

beforeEach(() => {
  jest.resetAllMocks()
  global.fetch = jest.fn()
  partialMocked(createMqtt).mockResolvedValue({ publish })
})

test("activeGame handler reacts to topics relating to tracking active game state", () => {
  expect(handler.shouldHandle(validTopic)).toEqual(true)
  expect(handler.shouldHandle(`homeassistant/game_media_player/state`)).toEqual(
    false,
  )
})

test("Given a valid topic and a payload with an area ID, playnite ID and state, when handling the message, then the game ID, platform name are retrieved from the graph and sent via mqtt message to update Home Assistant.", async () => {
  process.env.GRAPH_HOST = "http://graphHost"
  when(fetch)
    .calledWith("http://graphHost", {
      method: "POST",
      body: JSON.stringify({
        query:
          "query Game($id: String!) { gameReleaseByPlayniteId(id: $id) { name platform { id name } } }",
        variables: { id: "123" },
      }),
      headers: {
        "content-type": "application/json",
      },
    })
    .mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          gameReleaseByPlayniteId: {
            name: "Doom Eternal",
            platform: { id: "321", name: "Windows (PC)" },
          },
        },
      }),
    })

  await handler.handle(
    validTopic,
    Buffer.from(
      JSON.stringify({ id: "123", state: "starting", areaId: "game_room" }),
    ),
  )

  expect(publish).toBeCalledWith(
    `homeassistant/game_room/game_media_player/state`,
    Buffer.from(
      JSON.stringify({
        state: "starting",
        id: "123",
        platformName: "Windows (PC)",
        platformId: "321",
        name: "Doom Eternal",
      }),
    ),
  )
})

test("Given a valid topic, and a payload with an unsupported state, when handling the message, then no state change is published to Home Assistant.", async () => {
  await handler.handle(
    validTopic,
    Buffer.from(
      JSON.stringify({ id: "123", state: "installed", areaId: "game_room" }),
    ),
  )
  expect(publish).not.toBeCalled()
})
