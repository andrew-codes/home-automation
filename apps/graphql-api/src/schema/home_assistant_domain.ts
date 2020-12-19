import createDebug from "debug"
import path from "path"
import { list, objectType } from "nexus"
import { Node } from "./node"
import { HomeAssistantEntityGraphType } from "./home_assistant_entity"
import { equality } from "../filter"
import {
  DomainEntityDomain,
  DomainHomeAssistantEntity,
  HomeAssistantEntity,
} from "../Domain"

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
