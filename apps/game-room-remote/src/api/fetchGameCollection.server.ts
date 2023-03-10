import { gql } from "../generated"
import { merge, omit } from "lodash"
import type {
  GameCollection,
  GameCollectionDefinition,
} from "../GameCollection"
import getClient from "./graphqlClient"

const fetchGameCollections = async (
  collectionDefinitions: GameCollectionDefinition[],
): Promise<[GameCollection[], any]> => {
  const gamesQuery = gql(/* GraphQL */ `
    query GameCollectionGames {
      games {
        id
        name
        coverImage
        backgroundImage
        releases {
          description
          releaseYear
          releaseDate
          lastActivity
        }
      }
    }
  `)

  console.log(gamesQuery)

  const client = getClient()
  const { games } = await client.request(gamesQuery)
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
