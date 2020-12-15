import createDebug from "debug"
import { objectType, queryField, stringArg } from "@nexus/schema"
import { Node } from "./node.js"
import { HomeAssistantEntity } from "./home_assistant_entity.js"
import { equality } from "../filter/index.js"

const debug = createDebug("@ha/graphql-api/home_assistant_entity")

export const HomeAssistantDomain = objectType({
  name: "HomeAssistantDomain",
  definition(t) {
    t.implements(Node)
    t.field("entities", {
      list: true,
      type: HomeAssistantEntity,
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
  list: true,
  type: HomeAssistantDomain,
  args: { ids: stringArg({ required: false, list: true }) },
  resolve(root, args, ctx) {
    return ctx.query({
      from: "home_assistant_domain",
      filters: !!args.ids ? [equality.filter("id", args.ids)] : undefined,
    })
  },
})
