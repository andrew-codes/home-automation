import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { isEmpty } from "lodash"
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
        `homeassistant/sensor/${areaId}_game_media_player_platform/config`,
        Buffer.from(
          JSON.stringify({
            name: `${areaName} Game Media Player Platform`,
            state_topic: `homeassistant/${areaId}/game_media_player/state`,
            value_template: "{{ value_json.platformName }}",
            optimistic: true,
            icon: "mdi:gamepad-square",
            entity_category: "diagnostic",
            unique_id: `${areaId}_game_media_player_platform`,
            device: {
              name: `${areaName} Game Media Player`,
              identifiers: [`${areaId}_game_media_player`],
              suggested_area: areaName,
            },
          }),
        ),
      )
      await mqtt.publish(
        `homeassistant/sensor/${areaId}_game_media_player_source_name/config`,
        Buffer.from(
          JSON.stringify({
            name: `${areaName} Game Media Player Source Name`,
            state_topic: `homeassistant/${areaId}/game_media_player/state`,
            value_template: "{{ value_json.name }}",
            optimistic: true,
            icon: "mdi:gamepad-square",
            entity_category: "diagnostic",
            unique_id: `${areaId}_game_media_player_source_name`,
            device: {
              name: `${areaName} Game Media Player`,
              identifiers: [`${areaId}_game_media_player`],
              suggested_area: areaName,
            },
          }),
        ),
      )
      await mqtt.publish(
        `homeassistant/sensor/${areaId}_game_media_player_platform_id/config`,
        Buffer.from(
          JSON.stringify({
            name: `${areaName} Game Media Player Platform ID`,
            state_topic: `homeassistant/${areaId}/game_media_player/state`,
            value_template: "{{ value_json.platformId }}",
            optimistic: true,
            icon: "mdi:gamepad-square",
            entity_category: "diagnostic",
            unique_id: `${areaId}_game_media_player_platform_id`,
            device: {
              name: `${areaName} Game Media Player`,
              identifiers: [`${areaId}_game_media_player`],
              suggested_area: areaName,
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
