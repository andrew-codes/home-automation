import { ActionArgs, json } from "@remix-run/node"
import { GraphQLError } from "graphql"
import gql from "graphql-tag"
import { sendGraphQLRequest } from "remix-graphql/index.server"
import { print } from "graphql"
import collections, { GameListGame } from "../../../collections.server"

type GamesListNextQueryData = {
  data?: {
    games: GameListGame[]
  }
  errors?: GraphQLError[]
}

export const action = async (args: ActionArgs) => {
  if (args.request.method === "POST") {
    const formData = await args.request.formData()
    const { collectionName, currentPage } = Object.fromEntries(formData)
    if (!collectionName || !currentPage) {
      return null
    }
    const collection = collections[collectionName.toString()]
    const pageNumber = parseInt(currentPage.toString())

    const gamesQuery = print(gql`
      query GameListNext {
        games {
          id
          name
          backgroundImage
          coverImage
          platformReleases {
            lastActivity
            description
          }
        }
      }
    `)
    const { data } = (await sendGraphQLRequest({
      args,
      endpoint: `${process.env.GRAPH_HOST}/graphql`,
      query: gamesQuery,
      variables: {},
    }).then((res) => res.json())) as GamesListNextQueryData
    const allGames = data?.games ?? []
    const games = collection(allGames) ?? []
    return json({ games: games.slice(0, pageNumber * 14) })
  }

  return null
}
