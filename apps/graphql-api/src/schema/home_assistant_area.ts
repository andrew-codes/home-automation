import { list, objectType } from "nexus"
import { HomeAssistantEntityGraphType } from "./home_assistant_entity"
import { equality } from "../filter"
import { DomainHomeAssistantEntity, HomeAssistantEntity } from "../Domain"

export const AreaGraphType = objectType({
  name: "HomeAssistantArea",
  definition(t) {
    t.id("id")
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
