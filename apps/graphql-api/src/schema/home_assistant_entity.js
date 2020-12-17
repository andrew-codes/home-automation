import createDebug from "debug"
import {
  arg,
  inputObjectType,
  interfaceType,
  list,
  mutationField,
  objectType,
} from "nexus"
import _ from "lodash"
import { HomeAssistantArea } from "./home_assistant_area"
import { equality } from "../filter/index"
import { HomeAssistantDomain } from "./home_assistant_domain"

const debug = createDebug("@ha/graphql-api/home_assistant_entity")

export const HomeAssistantEntityStateAttribute = objectType({
  name: "HomeAssistantEntityStateAttribute",
  definition(t) {
    t.string("name")
    t.string("value")
  },
})

export const HomeAssistantEntityState = objectType({
  name: "HomeAssistantEntityState",
  definition(t) {
    t.string("state")
    t.field("attributes", {
      type: list(HomeAssistantEntityStateAttribute),
      resolve(root, args, ctx) {
        return Object.entries(root.attributes).map(([k, v]) => ({
          name: k,
          value: v ? v.toString() : "",
        }))
      },
    })
  },
})

export const HomeAssistantEntity = objectType({
  name: "HomeAssistantEntity",
  definition(t) {
    t.id("id")
    t.string("name")
    t.field("domain", {
      type: HomeAssistantDomain,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "entity_domain",
          filters: [equality("id", root.domainId)],
        })
      },
    })
    t.field("area", {
      type: HomeAssistantArea,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "area",
          filters: [equality("id", root.areaId)],
        })
      },
    })
  },
})

export const InputEntity = inputObjectType({
  name: "InputEntity",
  definition(t) {
    t.string("id")
    t.string("name")
    t.string("area_id")
    t.string("domain_id")
  },
})

export const InputEntities = inputObjectType({
  name: "InputEntities",
  definition(t) {
    t.field("items", { type: list(InputEntity) })
  },
})

export const InputServiceCallPayload = inputObjectType({
  name: "InputServiceCallPayload",
  definition(t) {
    t.string("key")
    t.string("value")
  },
})

export const InputServiceCall = inputObjectType({
  name: "InputServiceCall",
  definition(t) {
    t.string("id")
    t.string("service")
    t.field("payload", { type: list(InputServiceCallPayload) })
  },
})

export const MergeEntities = mutationField("entities", {
  type: HomeAssistantEntity,
  args: {
    entities: arg({ type: InputEntities }),
  },
  async resolve(root, args, ctx) {
    debug("Args", args)
    const newAssetsOutput = await ctx.query({
      from: "home_assistant_entity",
      act: "new",
      select: ["id", "name", "area_id", "domain_id"],
      values: args.entities.items,
    })
    debug("new assets output", newAssetsOutput)
    return newAssetsOutput
  },
})

// export const HomeAssistantServiceCall = mutationField(
//   "homeAssistantCallService",
//   {
//     type: HomeAssistantEntity,
//     args: {
//       entity: arg({ type: InputServiceCall, required: true }),
//     },
//     async resolve(root, args, ctx) {
//       try {
//         debug("Args", args)
//         const domain = args.entity.id.split(".")[0]
//         const payload = args.entity.payload
//           ? args.entity.payload.reduce(
//               (acc, { key, value }) => ({
//                 ...acc,
//                 [key]: value,
//               }),
//               {}
//             )
//           : {}
//         debug(payload)
//         const resp = await ha.services.call(args.entity.service, domain, {
//           entity_id: args.entity.id,
//           ...payload,
//         })
//         debug(resp)
//       } catch (error) {
//         debug(error)
//       } finally {
//         return ctx.query({
//           from: "home_assistant_entity",
//           filters: [equality.filter("id", args.entity.id)],
//         })
//       }
//     },
//   }
// )
