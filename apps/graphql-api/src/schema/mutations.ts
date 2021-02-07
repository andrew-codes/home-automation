import createDebug from "debug"
import { booleanArg, list, mutationField, stringArg } from "nexus"
import { isEmpty, lowerCase } from "lodash"
import { HomeAssistantEntityGraphType } from "./home_assistant_entity"
import { equality } from "../filter"
import {
  DeviceTracker,
  DomainGame,
  DomainGamePlatform,
  GameEntity,
  GamePlatform,
  Group,
  HomeAssistantEntity,
} from "../Domain"
import { GameGraphType } from "./game"

const debug = createDebug("@ha/graphql-api/mutations")

// A weekend (3 days) worth of time per authorization.
const getAuthorizationTime = () => 4320

export const GuestDeviceTrackingMutation = mutationField("trackGuestDevice", {
  type: HomeAssistantEntityGraphType,
  args: {
    mac: stringArg(),
    isPrimary: booleanArg({ default: false }),
  },
  async resolve(root, args, ctx) {
    try {
      debug("Args", args)
      if (!args.mac) {
        throw new Error("Invalid argument")
      }
      await ctx.unifi.authorize_guest(args.mac, getAuthorizationTime())
      if (args.isPrimary) {
        await ctx.mqtt.publish("/homeassistant/guest/track-device", args.mac)
      }
    } catch (error) {
      debug(error)
    } finally {
      return ctx.query({
        from: "home_assistant_entity",
        filters: [equality(["attributes", "mac"], args.mac)],
      }) as Promise<HomeAssistantEntity>
    }
  },
})

export const RenewGuestDevicesMutation = mutationField("renewGuestDevices", {
  type: list(HomeAssistantEntityGraphType),
  async resolve(root, args, ctx) {
    let guestDeviceTrackers: DeviceTracker[] = []
    try {
      const guestGroup = ((await ctx.query({
        from: "home_assistant_entity",
        filters: [equality(["id"], "group.guests")],
      })) as unknown) as Group
      debug(guestGroup)

      if (isEmpty(guestGroup.attributes.entityId)) {
        return guestDeviceTrackers
      }

      const filters = guestGroup.attributes.entityId.map((entityId) =>
        equality(["id"], entityId)
      )
      debug(filters)
      let guestDevices = ((await ctx.query({
        from: "home_assistant_entity",
        filters,
      })) as unknown) as HomeAssistantEntity[] | HomeAssistantEntity
      debug("guest devices", guestDevices)

      if (!Array.isArray(guestDevices)) {
        guestDevices = [guestDevices]
      }
      guestDeviceTrackers = guestDevices.filter(
        (device) => device.domainId === "device_tracker"
      ) as DeviceTracker[]

      await Promise.all(
        guestDeviceTrackers.map(
          async (deviceTracker) =>
            await ctx.unifi.authorize_guest(deviceTracker.attributes.mac),
          getAuthorizationTime()
        )
      )
      debug(guestDeviceTrackers)
      return guestDeviceTrackers
    } catch (error) {
      debug(error)
    }
    return guestDeviceTrackers
  },
})

export const PlayGameInGameRoomMutation = mutationField("playGameInGameRoom", {
  type: GameGraphType,
  args: {
    id: stringArg(),
  },
  async resolve(root, args, ctx) {
    try {
      debug("Args", args)
      if (!args.id) {
        throw new Error("Invalid argument")
      }
      const currentGameResults = (await ctx.query({
        from: "game",
      })) as GameEntity[]
      const currentGame = currentGameResults.find(
        (game) => game.isStarting || game.isStarting
      )
      if (!!currentGame) {
        throw new Error(`A game is already running: ${currentGame.name}`)
      }

      const gameToPlay = (await ctx.query({
        from: "game",
        filters: [equality<DomainGame>("playniteId", args.id)],
      })) as GameEntity

      if (isEmpty(gameToPlay)) {
        throw new Error(`No matching game found for ID: ${args.id}`)
      }

      const gamePlatform = (await ctx.query({
        from: "game_platform",
        filters: [equality<DomainGamePlatform>("id", gameToPlay.platformId)],
      })) as GamePlatform

      if (isEmpty(gamePlatform)) {
        throw new Error(
          `Could not find game platform: ${gameToPlay.platformId}`
        )
      }

      const normalizedPlatform = normalizePlatform(gamePlatform)
      debug(
        "Turning on media player",
        `media_player.gaming_room_universal_${normalizedPlatform}`
      )
      const turnOnMediaPlayerRepsonse = await ctx.ha.services.call(
        "turn_on",
        "media_player",
        {
          entity_id: `media_player.gaming_room_universal_${normalizedPlatform}`,
        }
      )
      debug(turnOnMediaPlayerRepsonse)

      if (normalizedPlatform === "gaming_pc") {
        debug("Publishing play pc game", gameToPlay.playniteId)
        await ctx.mqtt.publish(
          `/playnite/game/play`,
          JSON.stringify({ id: gameToPlay.playniteId, platform: "pc" })
        )
      } else if (normalizedPlatform === "playstation_4_pro") {
        await ctx.mqtt.publish(
          `/playnite/game/play`,
          JSON.stringify({ id: gameToPlay.playniteId, platform: "ps4" })
        )
        debug("Setting source for PS4 media player", gameToPlay.name)
        const setSourceResponse = await ctx.ha.services.call(
          "select_source",
          "media_player",
          {
            entity_id: `media_player.gaming_room_universal_${normalizedPlatform}`,
            source: gameToPlay.name,
          }
        )
        debug(setSourceResponse)
      }
      return gameToPlay
    } catch (error) {
      debug(error)
    }
    return null
  },
})

export const StopGameInGameRoomMutation = mutationField("stopGameInGameRoom", {
  type: GameGraphType,
  async resolve(root, args, ctx) {
    try {
      const currentGameResults = (await ctx.query({
        from: "game",
      })) as GameEntity[]
      const currentGame = currentGameResults.find(
        (game) => game.isStarting || game.isStarted
      )
      if (!currentGame) {
        throw new Error("No game is currently playing")
      }
      const gamePlatform = (await ctx.query({
        from: "game_platform",
        filters: [equality<DomainGamePlatform>("id", currentGame.platformId)],
      })) as GamePlatform

      if (isEmpty(gamePlatform)) {
        throw new Error(
          `Could not find game platform: ${currentGame.platformId}`
        )
      }
      const normalizedPlatform = normalizePlatform(gamePlatform)

      // if (normalizedPlatform === "gaming_pc") {
      // } else if (normalizedPlatform === "playstation_4_pro") {
      // }
      await ctx.mqtt.publish(`/playnite/game/stopped`, currentGame.playniteId)
      return currentGame
    } catch (error) {
      debug(error)
    }
    return null
  },
})

function normalizePlatform(platform: GamePlatform): string {
  const lowerName = lowerCase(platform.name)
  if (/pc/.test(lowerName)) {
    return "gaming_pc"
  }
  if (/play station 4/.test(lowerName)) {
    return "playstation_4_pro"
  }
  return "gaming_pc"
}
