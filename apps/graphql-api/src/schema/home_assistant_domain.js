import createDebug from "debug"
import { list, objectType, queryField, stringArg } from "nexus"
import { Node } from "./node"
import { HomeAssistantEntity } from "./home_assistant_entity"
import { equality } from "../filter"

const debug = createDebug("@ha/graphql-api/home_assistant_entity")

export const HomeAssistantDomain = objectType({
  name: "HomeAssistantDomain",
  definition(t) {
    t.implements(Node)
    t.field("entities", {
      type: list(HomeAssistantEntity),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "home_assistant_entity",
          filters: [equality("domainId", root.id)],
        })
      },
    })
  },
})

export const HomeAssistantDomainQuery = queryField("domain", {
  type: list(HomeAssistantDomain),
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    return ctx.query({
      from: "entity_domain",
      filters: !!args.ids ? [equality("id", args.ids)] : undefined,
    })
  },
})
