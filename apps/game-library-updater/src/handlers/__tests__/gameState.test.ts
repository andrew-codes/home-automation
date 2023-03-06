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
const updateOneGameArea = jest.fn()
const updateOneGameActivity = jest.fn()

beforeEach(async () => {
  jest.resetAllMocks()

  when(collection)
    .calledWith("gameAreas")
    .mockReturnValue({ updateOne: updateOneGameArea })
  when(collection)
    .calledWith("gameActivities")
    .mockReturnValue({ updateOne: updateOneGameActivity })
  db.mockReturnValue({ collection })
  partialMocked(getDbClient).mockResolvedValue({ db })
})

test("Given a valid topic for a game state change, when checking if the handler should handle the message, then it returns true.", async () => {
  const shouldHandle = handler.shouldHandle(validTopic)
  expect(shouldHandle).toBe(true)
})

test("Given a valid topic for a game state change of installing, when handling the message, then the database collection for game activity is updated with the game activity information.", async () => {
  await handler.handle(
    validTopic,
    Buffer.from(
      JSON.stringify({
        id: "123",
        state: "installing",
        areaId: "game_room",
      }),
      "utf8",
    ),
  )

  expect(updateOneGameActivity).toBeCalledTimes(1)
  expect(updateOneGameActivity).toHaveBeenCalledWith(
    { _id: "game_room" },
    {
      $set: {
        id: "game_room",
        releaseId: "123",
        isInstalling: true,
        isInstalled: false,
        isLaunching: false,
        isRunning: false,
        isUninstalling: false,
      },
    },
    { upsert: true },
  )
})

test("Given a valid topic for a game state change of installed, when handling the message, then the database collection for game activity is updated with the game activity information.", async () => {
  await handler.handle(
    validTopic,
    Buffer.from(
      JSON.stringify({
        id: "123",
        state: "installed",
        areaId: "game_room",
      }),
      "utf8",
    ),
  )

  expect(updateOneGameActivity).toBeCalledTimes(1)
  expect(updateOneGameActivity).toHaveBeenCalledWith(
    { _id: "game_room" },
    {
      $set: {
        id: "game_room",
        releaseId: "123",
        isInstalling: false,
        isInstalled: true,
        isLaunching: false,
        isRunning: false,
        isUninstalling: false,
      },
    },
    { upsert: true },
  )
})

test("Given a valid topic for a game state change of starting, when handling the message, then the database collection for game activity is updated with the game activity information.", async () => {
  await handler.handle(
    validTopic,
    Buffer.from(
      JSON.stringify({
        id: "123",
        state: "starting",
        areaId: "game_room",
      }),
      "utf8",
    ),
  )

  expect(updateOneGameActivity).toBeCalledTimes(1)
  expect(updateOneGameActivity).toHaveBeenCalledWith(
    { _id: "game_room" },
    {
      $set: {
        id: "game_room",
        releaseId: "123",
        isInstalling: false,
        isInstalled: true,
        isLaunching: true,
        isRunning: false,
        isUninstalling: false,
      },
    },
    { upsert: true },
  )
})

test("Given a valid topic for a game state change of started, when handling the message, then the database collection for game activity is updated with the game activity information.", async () => {
  await handler.handle(
    validTopic,
    Buffer.from(
      JSON.stringify({
        id: "123",
        state: "started",
        areaId: "game_room",
      }),
      "utf8",
    ),
  )

  expect(updateOneGameActivity).toBeCalledTimes(1)
  expect(updateOneGameActivity).toHaveBeenCalledWith(
    { _id: "game_room" },
    {
      $set: {
        id: "game_room",
        releaseId: "123",
        isInstalling: false,
        isInstalled: true,
        isLaunching: false,
        isRunning: true,
        isUninstalling: false,
      },
    },
    { upsert: true },
  )
})

test("Given a valid topic for a game state change of stopped, when handling the message, then the database collection for game activity is updated with the game activity information.", async () => {
  await handler.handle(
    validTopic,
    Buffer.from(
      JSON.stringify({
        id: "123",
        state: "stopped",
        areaId: "game_room",
      }),
      "utf8",
    ),
  )

  expect(updateOneGameActivity).toBeCalledTimes(1)
  expect(updateOneGameActivity).toHaveBeenCalledWith(
    { _id: "game_room" },
    {
      $set: {
        id: "game_room",
        releaseId: "123",
        isInstalling: false,
        isInstalled: true,
        isLaunching: false,
        isRunning: false,
        isUninstalling: false,
      },
    },
    { upsert: true },
  )
})

test("Given a valid topic for a game state change of uninstalling, when handling the message, then the database collection for game activity is updated with the game activity information.", async () => {
  await handler.handle(
    validTopic,
    Buffer.from(
      JSON.stringify({
        id: "123",
        state: "uninstalling",
        areaId: "game_room",
      }),
      "utf8",
    ),
  )

  expect(updateOneGameActivity).toBeCalledTimes(1)
  expect(updateOneGameActivity).toHaveBeenCalledWith(
    { _id: "game_room" },
    {
      $set: {
        id: "game_room",
        releaseId: "123",
        isInstalling: false,
        isInstalled: true,
        isLaunching: false,
        isRunning: false,
        isUninstalling: true,
      },
    },
    { upsert: true },
  )
})

test("Given a valid topic for a game state change of uninstalled, when handling the message, then the database collection for game activity is updated with the game activity information.", async () => {
  await handler.handle(
    validTopic,
    Buffer.from(
      JSON.stringify({
        id: "123",
        state: "uninstalled",
        areaId: "game_room",
      }),
      "utf8",
    ),
  )

  expect(updateOneGameActivity).toBeCalledTimes(1)
  expect(updateOneGameActivity).toHaveBeenCalledWith(
    { _id: "game_room" },
    {
      $set: {
        id: "game_room",
        releaseId: "123",
        isInstalling: false,
        isInstalled: false,
        isLaunching: false,
        isRunning: false,
        isUninstalling: false,
      },
    },
    { upsert: true },
  )
})
