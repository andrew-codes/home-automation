import createDebug from "debug"
import path from "path"
import {
  arg,
  inputObjectType,
  list,
  mutationField,
  objectType,
  queryField,
  stringArg,
} from "nexus"
import { keyBy } from "lodash"
import { AreaGraphType } from "./home_assistant_area"
import { equality } from "../filter/index"
import { DomainGraphType } from "./home_assistant_domain"
import {
  Area,
  DomainArea,
  DomainEntityDomain,
  DomainHomeAssistantEntity,
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
          filters: [equality<DomainEntityDomain>("id", root.domainId)],
        }) as Promise<EntityDomain>
      },
    })
    t.field("area", {
      type: AreaGraphType,
      async resolve(root, args, ctx) {
        return ctx.query({
          from: "area",
          filters: [equality<DomainArea>("id", root.areaId)],
        }) as Promise<Area>
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
        debug("HA API response", resp)
      } catch (error) {
        debug(error)
      } finally {
        return ctx.query({
          from: "home_assistant_entity",
          filters: [equality<DomainHomeAssistantEntity>("id", args.entity?.id)],
        }) as Promise<HomeAssistantEntity>
      }
    },
  }
)

export const DomainQuery = queryField("entitiy", {
  type: list(HomeAssistantEntityGraphType),
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    const results = await ctx.query({
      from: "home_assistant_entity",
      filters: args.ids?.map((id) =>
        equality<DomainHomeAssistantEntity>("id", id)
      ),
    })
    if (!Array.isArray(results)) {
      return [results]
    }
    return results
  },
})
