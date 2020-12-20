import createDebug from "debug"
import { booleanArg, list, mutationField, stringArg } from "nexus"
import { isEmpty } from "lodash"
import { HomeAssistantEntityGraphType } from "./home_assistant_entity"
import { equality } from "../filter"
import { DeviceTracker, Group, HomeAssistantEntity } from "../Domain"

const debug = createDebug("@ha/graphql-api/guest_devices")

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
