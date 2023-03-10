import { gql } from "../generated"
import { useQuery } from "@apollo/client"
import { json, LoaderArgs } from "@remix-run/node"
import useLoaderData from "../useLoaderData"

const query = gql(/* GraphQL */ `
  query GamesInArea($areaId: ID!) {
    gamesInArea(id: $areaId) {
      name
      coverImage
      backgroundImage
      releases {
        id
        completionState {
          name
          id
        }
        communityScore
        criticScore
        description
        platform {
          name
          id
        }
        releaseYear
      }
    }
  }
`)

const loader = async (args: LoaderArgs) => {
  const areaId = args.params.areaId

  return json({ areaId })
}

const Area = () => {
  const { areaId } = useLoaderData<typeof loader>()

  const { loading, data, error } = useQuery(query, {
    variables: { areaId: areaId ?? "game_room" },
  })

  return <h1>Hello {data?.gamesInArea.length}</h1>
}

export default Area
export { loader }
