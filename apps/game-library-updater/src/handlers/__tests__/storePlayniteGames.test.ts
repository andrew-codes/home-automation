jest.mock("../../dbClient")
import { when } from "jest-when"
import { partialMocked } from "@ha/jest-utils"
import handler from "../storePlayniteGames"
import getDbClient from "../../dbClient"
import multipleReferencesToSingleGamePayload from "./fixtures/multiple-references-to-single-game-payload.json"

const validTopic = "playnite/library/game/attributes"
const collection = jest.fn()
const updateOne = jest.fn()
const db = jest.fn()

beforeEach(async () => {
  jest.resetAllMocks()

  when(collection).calledWith("playniteGames").mockReturnValue({ updateOne })
  db.mockReturnValue({ collection })
  partialMocked(getDbClient).mockResolvedValue({ db })
})

test("Given a valid topic, When handling the message, then each playnite game in the payload is stored in the playniteGames collection.", async () => {
  await handler.handle(
    validTopic,
    Buffer.from(JSON.stringify(multipleReferencesToSingleGamePayload), "utf8"),
  )

  expect(updateOne).toBeCalledTimes(2)
  multipleReferencesToSingleGamePayload.forEach((playniteGame) => {
    expect(updateOne).toBeCalledWith(
      { _id: playniteGame.Id },
      { $set: playniteGame },
      { upsert: true },
    )
  })
})
