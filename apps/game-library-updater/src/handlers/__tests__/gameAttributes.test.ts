jest.mock("../../dbClient")
import { when } from "jest-when"
import { partialMocked } from "@ha/jest-utils"
import handler from "../gameAttributes"
import getDbClient from "../../dbClient"
import multipleReferencesToSingleGamePayload from "./fixtures/multiple-references-to-single-game-payload.json"
import gamesWithoutPlatforms from "./fixtures/games-without-a-platform.json"

const validTopic = "playnite/library/game/attributes"
const collection = jest.fn()
const updateOneGame = jest.fn()
const updateGameRelease = jest.fn()
const updatePlatform = jest.fn()
const db = jest.fn()

beforeEach(async () => {
  jest.resetAllMocks()

  when(collection)
    .calledWith("games")
    .mockReturnValue({ updateOne: updateOneGame })
  when(collection)
    .calledWith("gameReleases")
    .mockReturnValue({ updateOne: updateGameRelease })
  when(collection)
    .calledWith("platforms")
    .mockReturnValue({ updateOne: updatePlatform })
  const collections = [
    "genres",
    "developers",
    "publishers",
    "features",
    "series",
    "ageRatings",
    "source",
    "completionStatus",
  ].forEach((collectionKey) => {
    when(collection)
      .calledWith(collectionKey)
      .mockReturnValue({ updateOne: jest.fn() })
  })
  db.mockReturnValue({ collection })
  partialMocked(getDbClient).mockResolvedValue({ db })
})

describe("Given a valid topic and payload containing multiple references to single game with differing platforms", () => {
  test("When handling the message, then the multiple references are condensed down to a single game reference to be stored in the games table.", async () => {
    await handler.handle(
      validTopic,
      Buffer.from(
        JSON.stringify(multipleReferencesToSingleGamePayload),
        "utf8",
      ),
    )

    expect(updateOneGame).toBeCalledTimes(1)
    expect(updateOneGame).toBeCalledWith(
      {
        _id: "3d87f530-bee9-4f73-9d86-032819ff6ca8_3d87f530-bee9-4f73-9d86-032819ff6ca9",
      },
      expect.objectContaining({
        $set: expect.objectContaining({
          id: "3d87f530-bee9-4f73-9d86-032819ff6ca8_3d87f530-bee9-4f73-9d86-032819ff6ca9",
          backgroundImage: "3442ae96-6ef8-475a-8bab-bddceb14905c.jpg",
          coverImage: "9c9d62b6-ea63-4ff2-9cbe-e8b94fbf88ef.png",
          genreIds: [
            "0a567d14-7ad5-4bfb-a4a2-b7454e4464e5",
            "5aa8473a-d485-434b-a708-dc119d50307a",
            "4c0cd831-82f1-417e-a087-47b32d247936",
          ],
          icon: null,
          name: "DOOM Eternal",

          seriesIds: ["9836bd97-1349-4109-891f-1f0d83390eca"],
          platformReleaseIds: [
            "a7aae1e8-8a12-4282-9d4f-5ad2f70f6a37_3d87f530-bee9-4f73-9d86-032819ff6ca8_3d87f530-bee9-4f73-9d86-032819ff6ca9",
            "6ac977b9-f496-4c49-bb38-f9627a67affc_3d87f530-bee9-4f73-9d86-032819ff6ca8_3d87f530-bee9-4f73-9d86-032819ff6ca9",
          ],
        }),
      }),
      { upsert: true },
    )
  })

  test("When handling the message, each game release reference is stored in the gamesReleases table.", async () => {
    await handler.handle(
      validTopic,
      Buffer.from(
        JSON.stringify(multipleReferencesToSingleGamePayload),
        "utf8",
      ),
    )

    expect(updateGameRelease).toBeCalledTimes(2)
    expect(updateGameRelease).toBeCalledWith(
      {
        _id: "a7aae1e8-8a12-4282-9d4f-5ad2f70f6a37_3d87f530-bee9-4f73-9d86-032819ff6ca8_3d87f530-bee9-4f73-9d86-032819ff6ca9",
      },
      expect.objectContaining({
        $set: expect.objectContaining({
          id: "a7aae1e8-8a12-4282-9d4f-5ad2f70f6a37_3d87f530-bee9-4f73-9d86-032819ff6ca8_3d87f530-bee9-4f73-9d86-032819ff6ca9",
          playniteId: "3d87f530-bee9-4f73-9d86-032819ff6ca8",
          added: new Date(Date.parse("2021-12-23T09:20:32.303-05:00")),
          communityScore: 85,
          criticScore: 86,
          gameId:
            "3d87f530-bee9-4f73-9d86-032819ff6ca8_3d87f530-bee9-4f73-9d86-032819ff6ca9",
          description:
            "Hell’s armies have invaded Earth. Become the Slayer in an epic single-player campaign to conquer demons across dimensions and stop the final destruction of humanity. The only thing they fear... is you.",
          isInstalled: true,
          isInstalling: true,
          isLaunching: true,
          isRunning: true,
          isUninstalling: true,
          platformId: "a7aae1e8-8a12-4282-9d4f-5ad2f70f6a37",
          lastActivity: new Date(Date.parse("2021-07-31T12:25:42.34-04:00")),
          sourceId: "7323d2ad-07cf-4c04-a1db-aec3886be258",
          releaseDate: new Date(Date.parse("2019-3-19")),
          releaseYear: 2019,
          playCount: 10,
          playtime: 12061,
          playId: "PPSA01981_00",
        }),
      }),
      { upsert: true },
    )
    expect(updateGameRelease).nthCalledWith(
      2,
      {
        _id: "6ac977b9-f496-4c49-bb38-f9627a67affc_3d87f530-bee9-4f73-9d86-032819ff6ca8_3d87f530-bee9-4f73-9d86-032819ff6ca9",
      },
      expect.objectContaining({
        $set: expect.objectContaining({
          id: "6ac977b9-f496-4c49-bb38-f9627a67affc_3d87f530-bee9-4f73-9d86-032819ff6ca8_3d87f530-bee9-4f73-9d86-032819ff6ca9",
          playniteId: "3d87f530-bee9-4f73-9d86-032819ff6ca9",
          added: new Date(Date.parse("2022-12-23T09:20:32.303-05:00")),
          communityScore: 95,
          criticScore: 96,
          gameId:
            "3d87f530-bee9-4f73-9d86-032819ff6ca8_3d87f530-bee9-4f73-9d86-032819ff6ca9",
          description:
            "Hell’s armies have invaded Earth. Become the Slayer in an epic single-player campaign to conquer demons across dimensions and stop the final destruction of humanity. The only thing they fear... is you.",
          isInstalled: false,
          isInstalling: false,
          isLaunching: false,
          isRunning: false,
          isUninstalling: false,
          platformId: "6ac977b9-f496-4c49-bb38-f9627a67affc",
          lastActivity: new Date(Date.parse("2021-07-31T12:25:42.34-04:00")),
          sourceId: "7323d2ad-07cf-4c04-a1db-aec3886be258",
          releaseDate: new Date(Date.parse("2020-3-19")),
          releaseYear: 2020,
          playCount: 3,
          playtime: 13071,
          playId: "PPSA01981_01",
        }),
      }),
      { upsert: true },
    )
  })
})

test("Given a valid topic and payload with games that have no platform, when handling the message, then games without platforms are not processed and not stored collections.", async () => {
  await handler.handle(
    validTopic,
    Buffer.from(JSON.stringify(gamesWithoutPlatforms), "utf8"),
  )

  expect(updateOneGame).not.toBeCalled()
  expect(updateGameRelease).not.toBeCalled()
  expect(updatePlatform).not.toBeCalled()
})

describe("Updating platforms", () => {
  test("Given a valid topic and a payload of many games with overlapping platforms, when handing the message, then each distinct platform in updated in the database.", async () => {
    await handler.handle(
      validTopic,
      Buffer.from(
        JSON.stringify(multipleReferencesToSingleGamePayload),
        "utf8",
      ),
    )
    expect(updatePlatform).toBeCalled()
  })
})
