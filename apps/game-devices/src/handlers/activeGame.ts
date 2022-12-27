import { createLogger } from "@ha/logger"
import { isEmpty } from "lodash"
import { createMqtt } from "@ha/mqtt-client"
import { MessageHandler } from "./types"

const logger = createLogger()

const expr = /^playnite\/library\/game\/state$/
const supportedStates = ["started", "starting", "stopped"]

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => expr.test(topic),
  handle: async (topic, payload) => {
    logger.info(`Handling topic ${topic}`)
    try {
      const { id, state, areaId } = JSON.parse(payload.toString())

      if (isEmpty(id) || isEmpty(areaId) || isEmpty(state)) {
        throw new Error("Invalid payload; missing properties")
      }

      if (!supportedStates.includes(state)) {
        throw new Error(
          `Cannot handle an unsupported state. Only accepts states: started, starting, stopped.`,
        )
      }

      const {
        data: { gameReleaseByPlayniteId },
      } = await fetch(process.env.GRAPH_HOST ?? "", {
        method: "POST",
        body: JSON.stringify({
          query:
            "query Game($id: String!) { gameReleaseByPlayniteId(id: $id) { name platform { id name } } }",
          variables: { id },
        }),
        headers: {
          "content-type": "application/json",
        },
      }).then((resp) => resp.json())

      const mqtt = await createMqtt()
      await mqtt.publish(
        `homeassistant/${areaId}/game_media_player/state`,
        Buffer.from(
          JSON.stringify({
            state,
            id,
            platformName: gameReleaseByPlayniteId.platform.name,
            platformId: gameReleaseByPlayniteId.platform.id,
            name: gameReleaseByPlayniteId.name,
          }),
        ),
      )
    } catch (error) {
      logger.error(error)
    }
  },
}

export default messageHandler
