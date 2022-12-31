import { gql } from "graphql-request"
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
        backgroundImage
        coverImage
        platformReleases {
          releaseYear
          releaseDate
          lastActivity
          description
        }
      }
    }
  `
  const client = getClient()
  const { games } = await client.request<{
    games: Game[]
  }>(gamesQuery)

  return collectionDefinitions.map((collection) => {
    return {
      name: collection.name,
      games: collection
        .filter(games)
        .slice(0, collection.currentViewIndex * collection.countPerView * 2),
    }
  })
}

export default fetchGameCollections
