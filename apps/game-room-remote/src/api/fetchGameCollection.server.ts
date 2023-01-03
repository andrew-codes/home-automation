import { gql } from "graphql-request"
import { merge, omit } from "lodash"
import { Game } from "../Game"
import type {
  GameCollection,
  GameCollectionDefinition,
} from "../GameCollection"
import getClient from "./graphqlClient"

const fetchGameCollections = async (
  collectionDefinitions: GameCollectionDefinition[],
): Promise<GameCollection[]> => {
  const gamesQuery = gql`
    query Games {
      games {
        id
        name
        coverImage
        backgroundImage
        platformReleases {
          releaseYear
          releaseDate
          lastActivity
        }
      }
    }
  `
  const client = getClient()
  const { games } = await client.request<{
    games: Game[]
  }>(gamesQuery)

  const collections = collectionDefinitions.map((collectionDefinition) =>
    merge({}, omit(collectionDefinition, ["filter"]), {
      games: collectionDefinition
        .filter(games)
        .slice(
          0,
          (collectionDefinition.currentPageIndex + 1) *
            collectionDefinition.countPerPage *
            4,
        ),
    }),
  )

  return collections
}

export default fetchGameCollections
