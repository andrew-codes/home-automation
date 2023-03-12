import { filter } from "lodash/fp"
import { GameCollectionDefinition } from "../../types"

const collectionDefinition: GameCollectionDefinition = {
  id: "continue",
  name: "Continue",
  filter: filter<any>((game) =>
    game.releases.some((release) =>
      ["Plan to Play", "Playing", "On Hold"].includes(
        release.completionState.name,
      ),
    ),
  ),
}

export default collectionDefinition
