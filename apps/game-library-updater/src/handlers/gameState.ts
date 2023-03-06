import { flow, startCase, toLower } from "lodash/fp"
import { createLogger } from "@ha/logger"
import { MessageHandler } from "./types"
import getMongoDbClient from "../dbClient"

const logger = createLogger()

const expr = /^playnite\/library\/game\/state$/

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => expr.test(topic),
  handle: async (topic, payload) => {
    logger.info(`Game state updates handling topic: ${topic}`)
    const gameStatePayload = JSON.parse(payload.toString())

    const client = await getMongoDbClient()
    const db = await client.db("gameLibrary")

    const name = flow(
      toLower,
      startCase,
    )(gameStatePayload.areaId.split("_").join(" "))

    await db.collection("gameAreas").updateOne(
      { _id: gameStatePayload.areaId },
      {
        $set: {
          name,
        },
      },
      { upsert: true },
    )

    const state = {
      isInstalling: gameStatePayload.state === "installing",
      isInstalled: [
        "installed",
        "starting",
        "started",
        "stopped",
        "uninstalling",
      ].includes(gameStatePayload.state),
      isLaunching: gameStatePayload.state === "starting",
      isRunning: gameStatePayload.state === "started",
      isUninstalling: gameStatePayload.state === "uninstalling",
    }

    await db.collection("gameActivities").updateOne(
      { _id: gameStatePayload.areaId },
      {
        $set: {
          releaseId: gameStatePayload.id,
          ...state,
        },
      },
      { upsert: true },
    )
  },
}

export default messageHandler
