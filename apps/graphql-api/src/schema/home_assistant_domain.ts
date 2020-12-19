import createDebug from "debug"
import path from "path"
import { list, objectType, queryField, stringArg } from "nexus"
import { Node } from "./node"
import { HomeAssistantEntityGraphType } from "./home_assistant_entity"
import { equality } from "../filter"
import {
  DomainEntityDomain,
  DomainHomeAssistantEntity,
  EntityDomain,
  HomeAssistantEntity,
} from "../Domain"
import { resetCounts } from "../dataProvider/dataSourceBatchPerformance"

const debug = createDebug("@ha/graphql-api/home_assistant_entity")

export const DomainGraphType = objectType({
  name: "HomeAssistantDomain",
  sourceType: {
    export: "EntityDomain",
    module: path.join(__dirname, "..", "Domain.ts"),
  },
  definition(t) {
    t.implements(Node)
    t.field("entities", {
      type: list(HomeAssistantEntityGraphType),
      resolve(root, args, ctx) {
        return ctx.query({
          from: "home_assistant_entity",
          filters: [equality<DomainHomeAssistantEntity>("domainId", root.id)],
        }) as Promise<HomeAssistantEntity[]>
      },
    })
  },
})

export const DomainQuery = queryField("domain", {
  type: list(DomainGraphType),
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    const results = (await ctx.query({
      from: "entity_domain",
      filters: args.ids?.map((id) => equality<DomainEntityDomain>("id", id)),
    })) as EntityDomain[] | EntityDomain
    if (!Array.isArray(results)) {
      return [results]
    }
    return results
  },
})
