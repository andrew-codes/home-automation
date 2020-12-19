import { list, queryField, stringArg } from "nexus"
import { equality } from "../filter"
import {
  Area,
  DomainArea,
  DomainEntityDomain,
  DomainHomeAssistantEntity,
  HomeAssistantEntity,
} from "../Domain"
import { HomeAssistantEntityGraphType } from "./home_assistant_entity"
import { AreaGraphType } from "./home_assistant_area"
import { DomainGraphType } from "./home_assistant_domain"

export const HAEntityQuery = queryField("entitiy", {
  type: list(HomeAssistantEntityGraphType),
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "home_assistant_entity",
      filters: args.ids?.map((id) =>
        equality<DomainHomeAssistantEntity>("id", id)
      ),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<HomeAssistantEntity | Error>).filter(
      (result) => !(result instanceof Error)
    ) as HomeAssistantEntity[]
  },
})

export const AreaQuery = queryField("area", {
  type: list(AreaGraphType),
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "area",
      filters: args.ids?.map((id) => equality<DomainArea>("id", id)),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<Area | Error>).filter(
      (result) => !(result instanceof Error)
    ) as Area[]
  },
})

export const DomainQuery = queryField("domain", {
  type: list(DomainGraphType),
  args: { ids: list(stringArg()) },
  async resolve(root, args, ctx) {
    let results = await ctx.query({
      from: "entity_domain",
      filters: args.ids?.map((id) => equality<DomainEntityDomain>("id", id)),
    })
    if (!Array.isArray(results)) {
      results = [results]
    }
    return (results as Array<HomeAssistantEntity | Error>).filter(
      (result) => !(result instanceof Error)
    ) as HomeAssistantEntity[]
  },
})
