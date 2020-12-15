import { interfaceType } from "@nexus/schema";

export const Node = interfaceType({
  name: "Node",
  definition(t) {
    t.id("id", {
      type: "String",
      description: "Unique identifier for the resource",
    });
    t.resolveType(() => null);
  },
});
