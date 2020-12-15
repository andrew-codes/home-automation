require("dotenv").config()
import createDebug from "debug"
import createMqttClient from "@ha/mqtt"
import createUnifi from "@ha/unifi"
import {
  arg,
  inputObjectType,
  mutationField,
  objectType,
  queryField,
} from "@nexus/schema"
import { merge } from "lodash"
import { equality } from "../filter"
import { InterfaceHomeAssistantEntity } from "./home_assistant_entity"
import { Node } from "./node"

const debug = createDebug("@ha/graphql-api/presence-devices")

const {
  MQTT_HOST,
  MQTT_PORT,
  MQTT_USERNAME,
  MQTT_PASSWORD,
  UNIFI_HOST,
  UNIFI_PORT,
  UNIFI_USER,
  UNIFI_PASSWORD,
} = process.env
const unifiConfig = {
  host: UNIFI_HOST,
  port: UNIFI_PORT,
  username: UNIFI_USER,
  password: UNIFI_PASSWORD,
}
const mqttConfig = {
  host: MQTT_HOST,
  port: MQTT_PORT,
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
}
const unifi = createUnifi(unifiConfig)

export const PresenceDevice = objectType({
  name: "PresenceDevice",
  definition(t) {
    t.implements(InterfaceHomeAssistantEntity)
    t.boolean("isPrimary")
    t.boolean("isGuest")
  },
})

export const TrackedGuestDevice = objectType({
  name: "TrackedGuestDevice",
  definition(t) {
    t.implements(Node)
    t.boolean("isPrimary")
  },
})

export const PresenceDeviceQuery = queryField("presenceDevice", {
  list: true,
  type: PresenceDevice,
  async resolve(root, args, ctx) {
    try {
      const familyGroup = ctx.query({
        from: "home_assistant_entity_states",
        filters: [equality.filter("id", ["group.family"])],
      })
      const guestGroup = ctx.query({
        from: "home_assistant_entity_states",
        filters: [equality.filter("id", ["group.guests"])],
      })
      const guestSecondaryGroup = ctx.query({
        from: "home_assistant_entity_states",
        filters: [equality.filter("id", ["group.guests_other_devices"])],
      })
      const groups = await Promise.all([
        familyGroup,
        guestGroup,
        guestSecondaryGroup,
      ])
      debug("groups", groups)
      const familyDevices = ctx.query({
        from: "home_assistant_entity",
        filters: [equality.filter("id", groups[0][0].attributes.entity_id)],
      })
      const guestDevices = ctx.query({
        from: "home_assistant_entity",
        filters: [equality.filter("id", groups[1][0].attributes.entity_id)],
      })
      const guestSecondaryDevices = ctx.query({
        from: "home_assistant_entity",
        filters: [equality.filter("id", groups[2][0].attributes.entity_id)],
      })
      const devices = await Promise.all([
        familyDevices,
        guestDevices,
        guestSecondaryDevices,
      ])
      const familyOutput = devices[0].map((d) =>
        merge(d, { isPrimary: true, isGuest: false })
      )
      const guestOutput = devices[1].map((d) =>
        merge(d, { isPrimary: true, isGuest: true })
      )
      const guestSecondaryOutput = devices[2].map((d) =>
        merge(d, { isPrimary: false, isGuest: true })
      )
      const output = familyOutput
        .concat(guestOutput)
        .concat(guestSecondaryOutput)
      debug("devices", output)
      return output
    } catch (error) {
      debug(error)
    }
  },
})

export const TrackedGuestDevicesQuery = queryField("trackedGuestDevice", {
  list: true,
  type: TrackedGuestDevice,
  async resolve(root, args, ctx) {
    const devices = await ctx.query({
      from: "guest_device",
      select: ["id", "is_primary"],
    })
    let output = devices
    if (!Array.isArray(devices)) {
      output = [devices]
    }
    debug("devices", output)
    return output.map((d) => ({ id: d.id, isPrimary: d.is_primary }))
  },
})

export const InputTrackedGuest = inputObjectType({
  name: "InputTrackedGuest",
  definition(t) {
    t.string("mac", { required: true })
    t.boolean("isPrimary")
    t.boolean("isRegistered")
  },
})
// A weekend (3 days) worth of time per authorization.
const getAuthorizationTime = () => 4320
export const TrackGuest = mutationField("trackGuest", {
  type: PresenceDevice,
  args: {
    devices: arg({ type: InputTrackedGuest, required: true, list: true }),
  },
  async resolve(root, { devices }, ctx) {
    return Promise.all(
      devices.map(async ({ mac, isPrimary, isRegistered }) => {
        debug("device", mac, isPrimary, isRegistered)
        try {
          await unifi.authorize_guest(mac, getAuthorizationTime())
          const mqtt = await createMqttClient(mqttConfig)
          if (!isRegistered) {
            if (isPrimary) {
              debug("registering primary")
              await mqtt.publish("/home/guest/track-device", mac)
            } else {
              debug("registering secondary")
              await mqtt.publish("/home/guest/track-other-device", mac)
            }
          }
          await ctx.query({
            from: "guest_device",
            act: "new",
            select: ["id", "is_primary"],
            values: {
              id: mac,
              is_primary: !!isPrimary,
            },
          })
          const guestGroups = await ctx.query({
            from: "home_assistant_entity_states",
            filters: [
              equality.filter("id", [
                "group.guests",
                "group.guests_other_devices",
              ]),
            ],
          })
          debug(guestGroups)
          const entity_ids = guestGroups.reduce(
            (acc, group) => acc.concat(group.attributes.entity_id),
            []
          )
          const guestDevices = await ctx.query({
            from: "home_assistant_entity",
            filters: [equality.filter("id", entity_ids)],
          })
          const guestDevice = guestDevices.find(
            (d) => d.attributes.find((a) => a.name === "mac").value === mac
          )
          guestDevice.id = guestDevice.entity_id
          debug("matching guest device for mac", guestDevice)
          return guestDevice
        } catch (error) {
          debug(error)
          return null
        }
      })
    )
  },
})
