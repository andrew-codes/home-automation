import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { identity, isEmpty } from "lodash"
import { MessageHandler } from "./types"

const logger = createLogger()

const expr = /^homeassistant\/game_media_player\/state$/

const messageHandler: MessageHandler = {
  shouldHandle: (topic) => expr.test(topic),
  handle: async (topic, payload) => {
    logger.info(`Handling topic ${topic}`)
    try {
      const { areaName, areaId, supportedPlatforms } = JSON.parse(
        payload.toString(),
      )

      if (isEmpty(areaName) || isEmpty(areaId) || isEmpty(supportedPlatforms)) {
        throw new Error("Invalid payload; missing properties")
      }

      const mqtt = await createMqtt()
      await mqtt.publish(
        `homeassistant/sensor/${areaId}_game_media_player_source/config`,
        Buffer.from(
          JSON.stringify({
            name: `${areaName} Game Media Player Source`,
            state_topic: `playnite/${areaId}/game_media_player/state`,
            value_template: "{{ value_json.id }}",
            optimistic: true,
            icon: "mdi:gamepad-square",
            entity_category: "diagnostic",
            unique_id: `${areaId}_game_media_player_source`,
            device: {
              name: `${areaName} Game Media Player`,
              identifiers: [`${areaId}_game_media_player`],
              suggested_area: areaName,
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
            icon: "mdi:gamepad-square",
            entity_category: "diagnostic",
            unique_id: `${areaId}_game_media_player_state`,
            device: {
              name: `${areaName} Game Media Player`,
              identifiers: [`${areaId}_game_media_player`],
              suggested_area: areaName,
            },
          }),
        ),
      )
      await mqtt.publish(
        `homeassistant/sensor/${areaId}_game_media_player_platforms/config`,
        Buffer.from(
          JSON.stringify({
            name: `${areaName} Game Media Player Platforms`,
            state_topic: `homeassistant/${areaId}/game_media_player/platforms/state`,
            value_template: "{{ value_json }}",
            optimistic: true,
            icon: "mdi:gamepad-square",
            entity_category: "diagnostic",
            unique_id: `${areaId}_game_media_player_platforms`,
            device: {
              name: `${areaName} Game Media Player`,
              identifiers: [`${areaId}_game_media_player`],
              suggested_area: areaName,
            },
          }),
        ),
      )

      const {
        data: { platforms },
      } = await fetch(process.env.GRAPH_HOST ?? "", {
        method: "POST",
        body: JSON.stringify({
          query: "query Platforms{ platforms { id name } })",
        }),
        headers: {
          "content-type": "application/json",
        },
      }).then((resp) => resp.json())

      const supportedPlatformIds = supportedPlatforms
        .map((name) => platforms.find((platform) => platform.name === name)?.id)
        .filter(identity)

      await mqtt.publish(
        `homeassistant/${areaId}/game_media_player/platforms/state`,
        Buffer.from(JSON.stringify(supportedPlatformIds)),
      )
    } catch (error) {
      logger.error(error)
    }
  },
}

export default messageHandler
