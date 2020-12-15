import { objectType, queryField, stringArg } from "@nexus/schema";
import { Node } from "./node";
import { Game } from "./game";
import { equality } from "../filter";

export const Platform = objectType({
  name: "Platform",
  definition(t) {
    t.implements(Node);
    t.string("name");
    t.field("games", {
      list: true,
      type: Game,
      resolve(root, args, ctx) {
        return ctx.query({
          from: "game",
          filters: [equality.filter("platform_id", root.id)],
        });
      },
    });
  },
});

export const PlatformQuery = queryField("platform", {
  list: true,
  type: Platform,
  args: { ids: stringArg({ required: false, list: true }) },
  resolve(root, args, ctx) {
    return ctx.query({
      from: "platform",
      filters: !!args.ids ? [equality.filter("id", args.ids)] : undefined,
    });
  },
});
