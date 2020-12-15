import { objectType } from "@nexus/schema";
import { InterfaceHomeAssistantEntity } from "./home_assistant_entity";

export const MediaPlayer = objectType({
  name: "MediaPlayer",
  definition(t) {
    t.implements(InterfaceHomeAssistantEntity);
  },
});
