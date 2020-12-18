import createDebug from "debug"
import { inputObjectType, list, objectType, queryField, stringArg } from "nexus"
import { Node } from "./node"
import { HomeAssistantEntityGraphType } from "./home_assistant_entity"
import { equality } from "../filter"
import {
  DomainArea,
  DomainHomeAssistantEntity,
  HomeAssistantEntity,
} from "../Domain"

const debug = createDebug("@ha/graphql-api/home_assistant_area")

export const AreaGraphType = objectType({
  name: "HomeAssistantArea",
  definition(t) {
    t.implements(Node)
    t.string("name")
    t.field("entities", {
      type: list(HomeAssistantEntityGraphType),
      async resolve(root, args, ctx) {
        return ctx.query({
          from: "home_assistant_entity",
          filters: [equality<DomainHomeAssistantEntity>("areaId", root.id)],
        }) as Promise<HomeAssistantEntity[]>
      },
    })
  },
})

export const AreaQuery = queryField("area", {
  type: list(AreaGraphType),
  args: { ids: list(stringArg()) },
  resolve(root, args, ctx) {
    return ctx.query({
      from: "area",
      filters: !!args.ids ? [equality<DomainArea>("id", args.ids)] : undefined,
    })
  },
})

export const InputArea = inputObjectType({
  name: "InputArea",
  definition(t) {
    t.string("id")
    t.string("name")
  },
})
export const InputAreas = inputObjectType({
  name: "InputAreas",
  definition(t) {
    t.field("items", { type: list(InputArea) })
  },
})
