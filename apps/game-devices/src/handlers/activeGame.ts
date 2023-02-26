import { createLogger } from "@ha/logger"
import { isEmpty } from "lodash"
import { createMqtt } from "@ha/mqtt-client"
import { MessageHandler } from "./types"

const logger = createLogger()

const expr = /^playnite\/library\/game\/state$/
const supportedStates = ["start", "started", "starting", "stop", "stopped"]

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => expr.test(topic),
  handle: async (topic, payload) => {
    logger.info(`Handling topic ${topic}`)
    try {
      const { id, state, areaId } = JSON.parse(payload.toString())
      logger.info(`${id}, ${state}, ${areaId}`)
      if (isEmpty(id) || isEmpty(areaId) || isEmpty(state)) {
        throw new Error("Invalid payload; missing properties")
      }

      if (!supportedStates.includes(state)) {
        throw new Error(
          `Cannot handle an unsupported state. Only accepts states: started, starting, stopped.`,
        )
      }
      const {
        data: { gameReleaseById },
      } = await fetch(
        `${process.env.GRAPH_HOST}/graphql` ?? "http://localhost:8082",
        {
          method: "POST",
          body: JSON.stringify({
            query:
              "query GameReleaseById($id: String!) { gameReleaseById(id: $id) { game { name } playniteId platform { id name } } }",
            variables: { id },
          }),
          headers: {
            "content-type": "application/json",
          },
        },
      ).then((resp) => resp.json())
      console.log(gameReleaseById)
      const mqtt = await createMqtt()
      await mqtt.publish(
        `playnite/${areaId}/game_media_player/state`,
        Buffer.from(
          JSON.stringify({
            state,
            id: gameReleaseById.playniteId,
            platformName: gameReleaseById.platform.name,
            platformId: gameReleaseById.platform.id,
            name: gameReleaseById.game.name,
          }),
        ),
      )
    } catch (error) {
      logger.error(error)
    }
  },
}

export default messageHandler
