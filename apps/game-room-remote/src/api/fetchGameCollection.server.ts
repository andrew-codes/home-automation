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
): Promise<[GameCollection[], Game[]]> => {
  const gamesQuery = gql`
    query GameColectionGames {
      games {
        id
        name
        coverImage
        backgroundImage
        releases {
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

  const collections = collectionDefinitions.map((collectionDefinition) => {
    const collectionGames = collectionDefinition.filter(games)

    return merge({}, omit(collectionDefinition, ["filter"]), {
      games: collectionGames.slice(
        0,
        (collectionDefinition.currentPageIndex + 1) *
          collectionDefinition.countPerPage *
          4,
      ),
      total: collectionGames.length,
    })
  })

  return [collections, games]
}

export default fetchGameCollections
