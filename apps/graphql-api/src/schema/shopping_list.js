import createDebug from "debug"
import {
  arg,
  inputObjectType,
  mutationField,
  objectType,
  queryField,
  stringArg,
} from "@nexus/schema"
import { camelCase, flatten, isEmpty, merge, pick, startCase } from "lodash"
import { get } from "lodash/fp"
import { v4 as uuid } from "uuid"
import { equality } from "../filter"
import { Node } from "./node"

const formatItemValue = (value) =>
  value
    .split("/")
    .map((v) => startCase(camelCase(v)))
    .join("/")

const debug = createDebug("@ha/graphql-api/shopping_list")

export const ShoppingListItem = objectType({
  name: "ShoppingListItem",
  definition(t) {
    t.implements(Node)
    t.string("value")
    t.string("status")
  },
})
export const ShoppingList = objectType({
  name: "ShoppingList",
  definition(t) {
    t.implements(Node)
    t.string("name")
    t.string("state")
    t.boolean("isPrimary", (root) => root.name === "Alexa shopping list")
    t.field("items", {
      list: true,
      type: ShoppingListItem,
      resolve(root, args, ctx) {
        const filters = [equality.filter("listid", root.id)]
        if (!args.includeArchived) {
          filters.push(equality.filter("status", "archived", true))
        }
        return ctx.query({
          from: "shopping_list_item",
          select: ["id", "value", "status"],
          filters,
        })
      },
    })
  },
})

export const ShoppingListQuery = queryField("shoppingList", {
  list: true,
  type: ShoppingList,
  args: { ids: stringArg({ required: false, list: true }) },
  resolve(root, args, ctx) {
    return ctx.query({
      from: "shopping_list",
      filters: !!args.ids ? [equality.filter("id", args.ids)] : undefined,
    })
  },
})

export const PrimaryShoppingListQuery = queryField("primaryShoppingList", {
  type: ShoppingList,
  async resolve(root, args, ctx) {
    const list = await ctx.query({
      from: "shopping_list",
      filters: [equality.filter("name", "Alexa shopping list")],
    })
    return list[0]
  },
})

export const InputListItem = inputObjectType({
  name: "InputListItem",
  definition(t) {
    t.string("id")
    t.string("value", { require: true })
    t.string("status", { require: true })
  },
})
export const InputList = inputObjectType({
  name: "InputList",
  definition(t) {
    t.string("id", { required: true })
    t.string("name", { require: true })
    t.string("state", { require: true })
    t.field("items", { type: InputListItem, require: true, list: true })
  },
})
export const InputListItemUpdate = inputObjectType({
  name: "InputListItemUpdate",
  definition(t) {
    t.string("id", { required: true })
    t.field("items", { type: InputListItem, require: true, list: true })
  },
})
export const UpdateShoppingListItemsMutation = mutationField(
  "updateShoppingListItems",
  {
    list: true,
    type: ShoppingListItem,
    args: {
      list: arg({ type: InputListItemUpdate }),
    },
    async resolve(root, args, ctx) {
      debug("Args", args)
      const dataResponse = await Promise.all(
        args.list.items.map((item) =>
          ctx.query({
            from: "shopping_list_item",
            act: "new",
            select: ["id", "listid", "value", "status"],
            values: merge(item, {
              id: item.id ? item.id : uuid(),
              listid: args.list.id,
              value: formatItemValue(item.value),
            }),
          })
        )
      )
      debug("updated items response", dataResponse)
      const output = flatten(dataResponse)
      return output
    },
  }
)

export const DeleteShoppingListItemMutation = mutationField(
  "deleteShoppingListItems",
  {
    type: ShoppingListItem,
    args: {
      items: arg({ type: InputListItem, list: true }),
    },
    async resolve(root, args, ctx) {
      debug("Args", args)
      await ctx.query({
        from: "shopping_list_item",
        act: "remove",
        filters: [equality.filter("id", args.items.map(get("id")))],
      })
      return {}
    },
  }
)

export const AddListMutation = mutationField("addList", {
  type: ShoppingList,
  args: {
    list: arg({ type: InputList }),
  },
  async resolve(root, args, ctx) {
    debug("Args", args)
    const newListOutput = await ctx.query({
      from: "shopping_list",
      act: "new",
      select: ["id", "name", "state"],
      values: pick(args.list, ["id", "name", "state"]),
    })
    debug("saved list output", newListOutput)

    if (isEmpty(args.list.items)) {
      return {
        ...newListOutput[0],
        items: [],
      }
    }

    const newListItems = await ctx.query({
      from: "shopping_list_item",
      act: "new",
      select: ["id", "listid", "value", "status"],
      values: args.list.items.map((item) =>
        merge(item, {
          listid: args.list.id,
          value: formatItemValue(item.value),
        })
      ),
    })
    debug("saved list items output", newListItems)

    return {
      ...newList[0],
      items: newListItems,
    }
  },
})
