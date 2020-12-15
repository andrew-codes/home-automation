import createDebug from "debug"
import { objectType } from "@nexus/schema"
import { InterfaceHomeAssistantEntity } from "./home_assistant_entity"

const debug = createDebug("@ha/graphql-api/light")

export const Light = objectType({
  name: "Light",
  definition(t) {
    t.implements(InterfaceHomeAssistantEntity)
  },
})
