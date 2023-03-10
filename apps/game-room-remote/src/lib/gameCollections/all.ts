import { filter } from "lodash/fp"
import { GameCollectionDefinition } from "../../types"

const collectionDefinition: GameCollectionDefinition = {
  id: "all",
  name: "All Games",
  filter: filter<any>((game) => true),
}

export default collectionDefinition
