import { gql } from "graphql-request"
import { keyBy } from "lodash"
import { Game } from "../Game"
import getClient from "./graphqlClient"

const fetchGameCollections = async (gameIds: string[]): Promise<Game[]> => {
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
        }
      }
    }
  `
  const client = getClient()
  const { games } = await client.request<{
    games: Game[]
  }>(gamesQuery)
  const gamesById = keyBy(games, "id")

  return gameIds.map((id) => gamesById[id])
}

export default fetchGameCollections
