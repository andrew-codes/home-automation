import { interfaceType } from "nexus"

export const Node = interfaceType({
  name: "Node",
  definition(t) {
    t.id("id")
  },
  resolveType() {
    return null
  },
})
