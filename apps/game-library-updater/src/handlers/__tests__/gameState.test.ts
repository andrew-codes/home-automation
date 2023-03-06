jest.mock("../../dbClient")
import { partialMocked } from "@ha/jest-utils"
import { when } from "jest-when"
import getDbClient from "../../dbClient"
import handler from "../gameState"

const validTopic = "playnite/library/game/state"
const payload = Buffer.from(
  JSON.stringify({
    id: "123",
    state: "started",
    areaId: "game_room",
  }),
  "utf8",
)
const db = jest.fn()
const collection = jest.fn()
const updateOne = jest.fn()

beforeEach(async () => {
  jest.resetAllMocks()

  when(collection).calledWith("gameArea").mockReturnValue({ updateOne })
  db.mockReturnValue({ collection })
  partialMocked(getDbClient).mockResolvedValue({ db })
})

test("Given a valid topic for a game state change, when checking if the handler should handle the message, then it returns true.", async () => {
  const shouldHandle = handler.shouldHandle(validTopic)
  expect(shouldHandle).toBe(true)
})

test("Given a valid topic for game state change, when handling the message, then the database collection for game area is updated with the game state in the payload.", async () => {
  await handler.handle(validTopic, payload)

  expect(updateOne).toBeCalledTimes(1)
  expect(updateOne).toHaveBeenCalledWith(
    { _id: "game_room" },
    { $set: { gameId: "123", gameState: "started" } },
    { upsert: true },
  )
})
