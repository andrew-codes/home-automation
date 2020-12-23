import { list, objectType } from "nexus"
import { equality } from "../filter"

export const GameGraphType = objectType({
  name: "Game",
  definition(t) {
    t.boolean("favorite")
    t.boolean("hidden")
    t.id("id")
    t.int("playtime")
    t.int("releaseYear")
    t.string("coverImage")
    t.string("description")
    t.string("gameImagePath")
    t.string("name")
    t.string("platformId")
    t.string("sourceId")
    t.string("state")
  },
})
