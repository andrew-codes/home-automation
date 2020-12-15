import createDebug from "debug"
import {
  arg,
  inputObjectType,
  mutationField,
  objectType,
  queryField,
  stringArg,
} from "@nexus/schema"
import { Node } from "./node.js"
// import { Game } from "./game";
import { HomeAssistantEntity } from "./home_assistant_entity.js"
import { equality } from "../filter/index.js"

const debug = createDebug("@ha/graphql-api/home_assistant_area")

export const HomeAssistantArea = objectType({
  name: "HomeAssistantArea",
  definition(t) {
    t.implements(Node)
    t.string("name")
    t.field("entities", {
      list: true,
      type: HomeAssistantEntity,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "home_assistant_entity",
          filters: [equality.filter("area_id", root.id)],
        })
      },
    })
    // t.field("games", {
    //   list: true,
    //   type: Game,
    //   async resolve(root, args, ctx) {
    //     const entities = await ctx.query({
    //       from: "home_assistant_entity",
    //       select: ["id"],
    //       filters: [equality.filter("area_id", root.id)],
    //     })
    //     return ctx.query({
    //       from: "game",
    //       filters: [
    //         equality.filter(
    //           "entity_id",
    //           entities.map(({ id }) => id)
    //         ),
    //       ],
    //     })
    //   },
    // })
  },
})

export const HomeAssistantAreaQuery = queryField("area", {
  list: true,
  type: HomeAssistantArea,
  args: { ids: stringArg({ required: false, list: true }) },
  resolve(root, args, ctx) {
    return ctx.query({
      from: "home_assistant_area",
      filters: !!args.ids ? [equality.filter("id", args.ids)] : undefined,
    })
  },
})

export const InputArea = inputObjectType({
  name: "InputArea",
  definition(t) {
    t.string("id", { required: true })
    t.string("name", { require: true })
  },
})
export const InputAreas = inputObjectType({
  name: "InputAreas",
  definition(t) {
    t.field("items", { type: InputArea, list: true, required: true })
  },
})
export const MergeAreas = mutationField("areas", {
  type: HomeAssistantArea,
  args: {
    areas: arg({ type: InputAreas }),
  },
  async resolve(root, args, ctx) {
    debug("Args", args)
    const newAssetsOutput = await ctx.query({
      from: "home_assistant_area",
      act: "new",
      select: ["id", "name"],
      values: args.areas.items,
    })
    debug("new assets output", newAssetsOutput)
    return newAssetsOutput
  },
})
