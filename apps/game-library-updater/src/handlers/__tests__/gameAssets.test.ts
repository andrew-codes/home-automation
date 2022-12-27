jest.mock("fs/promises")
jest.mock("fs")
import { when } from "jest-when"
import fs from "fs/promises"
import { existsSync } from "fs"
import handler from "../gameAssets"
import path from "path"

const validTopic =
  "playnite/library/game/123-123/attributes/asset/9c9d62b6-ea63-4ff2-9cbe-e8b94fbf88ef.png"

beforeEach(async () => {
  jest.resetAllMocks()
})

test("Given a valid topic with an asset ID that already exists on disk, when handling the message, then the asset on disk is not overritten with the new payload.", async () => {
  const payload = Buffer.from("1")
  const assetPath = path.join(
    "/assets",
    "9c9d62b6-ea63-4ff2-9cbe-e8b94fbf88ef.png",
  )
  when(existsSync).calledWith(assetPath).mockReturnValue(true)
  await expect(() => handler.handle(validTopic, payload)).rejects.toThrow(
    "File exists",
  )

  expect(fs.writeFile).not.toBeCalledWith(assetPath, payload, "binary")
})

test("Given a valid topic and a binary payload containing a game asset, when handling the message, then the binary payload is saved to disk in the /assets directory with a filename of the asset ID.", async () => {
  const payload = Buffer.from("1")
  const assetPath = path.join(
    "/assets",
    "9c9d62b6-ea63-4ff2-9cbe-e8b94fbf88ef.png",
  )
  when(existsSync).calledWith(assetPath).mockReturnValue(false)

  await handler.handle(validTopic, payload)

  expect(fs.writeFile).toBeCalledWith(assetPath, payload, "binary")
})
