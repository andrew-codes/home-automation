import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { MessageHandler } from "./types"

const logger = createLogger()

const expr = /^homeassistant\/game_media_player\/state$/

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => expr.test(topic),
  handle: async (topic, payload) => {
    logger.info(`Handling topic ${topic}`)
    try {
      const { areaName, areaId } = JSON.parse(payload.toString())
      const mqtt = await createMqtt()
      await mqtt.publish(
        `homeassistant/text/${areaId}_game_media_player_source/config`,
        Buffer.from(
          JSON.stringify({
            name: `${areaName} Game Media Player Source`,
            command_topic: `playnite/${areaId}/game_media_player/source/cmd`,
            state_topic: `playnite/${areaId}/game_media_player/state`,
            value_template: "{{ value_json.id }}",
            optimistic: true,
            entity_category: "diagnostic",
            unique_id: `${areaId}_game_media_player_source`,
            device: {
              name: `${areaName} Game Media Player`,
              identifiers: [`${areaId}_game_media_player`],
              suggested_area: `${areaId}`,
            },
          }),
        ),
      )
      await mqtt.publish(
        `homeassistant/sensor/${areaId}_game_media_player_state/config`,
        Buffer.from(
          JSON.stringify({
            name: `${areaName} Game Media Player State`,
            state_topic: `playnite/${areaId}/game_media_player/state`,
            value_template: "{{ value_json.state }}",
            optimistic: true,
            entity_category: "diagnostic",
            unique_id: `${areaId}_game_media_player_state`,
            device: {
              name: `${areaName} Game Media Player`,
              identifiers: [`${areaId}_game_media_player`],
              suggested_area: `${areaId}`,
            },
          }),
        ),
      )
    } catch (error) {
      logger.error(error)
    }
  },
}

export default messageHandler
