import createDebug from "debug"
import { list, objectType, queryField, stringArg } from "nexus"
import { Node } from "./node.js"
import { HomeAssistantEntity } from "./home_assistant_entity.js"
import { equality } from "../filter/index.js"

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
          filters: [equality.filter("domain_id", root.id)],
        })
      },
    })
  },
})

export const HomeAssistantDomainQuery = queryField("domain", {
  type: list(HomeAssistantDomain),
  args: { ids: list(stringArg()) },
  resolve(root, args, ctx) {
    return ctx.query({
      from: "home_assistant_domain",
      filters: !!args.ids ? [equality.filter("id", args.ids)] : undefined,
    })
  },
})
