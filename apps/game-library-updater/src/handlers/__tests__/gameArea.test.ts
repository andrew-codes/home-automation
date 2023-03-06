jest.mock("../../dbClient")
import { partialMocked } from "@ha/jest-utils"
import { when } from "jest-when"
import getDbClient from "../../dbClient"
import handler from "../gameArea"

const validTopic = "playnite/library/area/config"
const db = jest.fn()
const collection = jest.fn()
const updateOneGameArea = jest.fn()
const updateOneGameAreaPlatforms = jest.fn()
const findPlatforms = jest.fn()

beforeEach(async () => {
  jest.resetAllMocks()

  when(collection)
    .calledWith("gameAreas")
    .mockReturnValue({ updateOne: updateOneGameArea })
  when(collection)
    .calledWith("gameAreasPlatforms")
    .mockReturnValue({ updateOne: updateOneGameAreaPlatforms })
  when(collection)
    .calledWith("platforms")
    .mockReturnValue({ find: findPlatforms })
  db.mockReturnValue({ collection })
  partialMocked(getDbClient).mockResolvedValue({ db })
})

test("Given a valid topic for a game area definition, when checking if the handler should handle the message, then it returns true.", async () => {
  const shouldHandle = handler.shouldHandle(validTopic)
  expect(shouldHandle).toBe(true)
})

test("Given a valid topic for a game area definition, when handling the message, then the database is updated to associate the area and the matched platforms (by name).", async () => {
  when(findPlatforms)
    .calledWith({ name: { $regex: "(Windows)|(PlayStation 5)" } })
    .mockReturnValue({
      map: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(["123", "456"]),
      }),
    })

  await handler.handle(
    validTopic,
    Buffer.from(
      JSON.stringify({
        id: "game_room",
        supportedPlatforms: ["Windows", "PlayStation 5"],
      }),
      "utf8",
    ),
  )

  expect(updateOneGameAreaPlatforms).toBeCalledTimes(2)
  expect(updateOneGameAreaPlatforms).toHaveBeenCalledWith(
    { _id: "game_room_123" },
    { $set: { areaId: "game_room", platformId: "123", id: "game_room_123" } },
    { upsert: true },
  )
  expect(updateOneGameAreaPlatforms).toHaveBeenCalledWith(
    { _id: "game_room_456" },
    { $set: { areaId: "game_room", platformId: "456", id: "game_room_456" } },
    { upsert: true },
  )
})
