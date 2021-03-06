import createDebug from "debug"
import path from "path"
import { arg, inputObjectType, list, mutationField, objectType } from "nexus"
import { keyBy } from "lodash"
import { AreaGraphType } from "./home_assistant_area"
import { equality } from "../filter/index"
import { DomainGraphType } from "./home_assistant_domain"
import {
  Area,
  DomainArea,
  DomainEntityDomain,
  DomainHomeAssistantEntity,
  DomainQuery,
  EntityDomain,
  HomeAssistantEntity,
} from "../Domain"

const debug = createDebug("@ha/graphql-api/home_assistant_entity")

export const HomeAssistantEntityGraphType = objectType({
  name: "HomeAssistantEntity",
  sourceType: {
    export: "HomeAssistantEntity",
    module: path.join(__dirname, "..", "Domain.ts"),
  },
  definition(t) {
    t.id("id")
    t.string("name")
    t.field("domain", {
      type: DomainGraphType,
      async resolve(root, args, ctx) {
        return ctx.query({
          from: "entity_domain",
          filters: [equality("id", root.domainId)],
        } as DomainQuery<DomainEntityDomain>) as Promise<EntityDomain>
      },
    })
    t.field("area", {
      type: AreaGraphType,
      async resolve(root, args, ctx) {
        return ctx.query({
          from: "area",
          filters: [equality("id", root.areaId)],
        } as DomainQuery<DomainArea>) as Promise<Area>
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

export const HomeAssistantServiceCall = mutationField(
  "homeAssistantCallService",
  {
    type: HomeAssistantEntityGraphType,
    args: {
      entity: arg({ type: InputServiceCall }),
    },
    async resolve(root, args, ctx) {
      try {
        debug("Args", args)
        if (!args.entity) {
          throw new Error("Invalid argument")
        }
        const domain = args.entity.id?.split(".")[0]
        const payload = keyBy(args.entity.payload || [], "key")
        const resp = await ctx.ha.services.call(args.entity.service, domain, {
          entity_id: args.entity.id,
          ...payload,
        })
      } catch (error) {
        debug(error)
      } finally {
        return ctx.query({
          from: "home_assistant_entity",
          filters: [equality("id", args.entity?.id)],
        } as DomainQuery<DomainHomeAssistantEntity>) as Promise<HomeAssistantEntity>
      }
    },
  }
)
