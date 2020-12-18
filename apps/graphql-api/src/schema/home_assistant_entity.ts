import createDebug from "debug"
import path from "path"
import { inputObjectType, list, objectType } from "nexus"
import _ from "lodash"
import { AreaGraphType } from "./home_assistant_area"
import { equality } from "../filter/index"
import { DomainGraphType } from "./home_assistant_domain"
import { Area, DomainArea, DomainEntityDomain, EntityDomain } from "../Domain"

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
