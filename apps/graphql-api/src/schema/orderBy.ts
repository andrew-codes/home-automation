import { enumType, inputObjectType } from "nexus"

export const OrderByType = enumType({
  name: "OrderByType",
  members: {
    asc: 1,
    desc: -1,
  },
})
