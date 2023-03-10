import { useCallback, useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import { json, LoaderArgs } from "@remix-run/node"
import styled from "styled-components"
import { merge } from "lodash"
import { gql } from "../generated"
import useLoaderData from "../useLoaderData"
import GameOverview from "../components/GameOverview"
import GameActions from "../components/GameActions"
import GameCollections from "../components/GameCollections"
import collectionDefinitions from "../lib/gameCollections"
import GameCollection from "../components/GameCollection"
import PrefetchGameBackgrounds from "../components/PrefetchGameBackgrounds"

const CenterPane = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  width: 100%;

  .swiper-slide {
    opacity: 1;
  }
  .swiper-slide-prev {
    transition: opacity 0.5s ease-in;
  }
  .swiper-slide-prev {
  }
`

const Overview = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 864px;

  > section {
    margin: 24px;
  }
`

const query = gql(/* GraphQL */ `
  query GamesInArea($areaId: ID!) {
    gamesInArea(id: $areaId) {
      id
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

  return json({ areaId, cdnHost: process.env.GAMING_ASSETS_WEB_HOST ?? "" })
}

const Area = () => {
  const { areaId, cdnHost } = useLoaderData<typeof loader>()

  const { loading, data, error } = useQuery(query, {
    variables: { areaId: areaId ?? "game_room" },
  })

  const games = useMemo(
    () =>
      data?.gamesInArea.map((game) =>
        merge({}, game, {
          coverImage: `${cdnHost}/resize/${game.coverImage}`,
          backgroundImage: `${cdnHost}/resize/${game.backgroundImage}`,
        }),
      ) ?? [],
    [data?.gamesInArea],
  )
  const collections = useMemo(
    () =>
      collectionDefinitions
        .map((collectionDefinition) => ({
          id: collectionDefinition.id,
          name: collectionDefinition.name,
          games: collectionDefinition.filter(games),
        }))
        .filter((collection) => collection.games.length > 0),
    [games, collectionDefinitions],
  )

  const [selectedGameId, setSelectedGameId] = useState(null)
  const selectedGame = useMemo(
    () => games.find(({ id }) => id === selectedGameId),
    [selectedGameId, games],
  )

  const handleSelectGame = useCallback((evt, gameId) => {
    setSelectedGameId(gameId)
  }, [])

  return (
    <CenterPane>
      <PrefetchGameBackgrounds games={games} height={1920} />
      <Overview>
        <GameOverview {...selectedGame} height={1920} />
        <GameActions {...selectedGame} />
      </Overview>
      <GameCollections
        collections={collections}
        gamesPerRow={4}
        rows={3}
        spaceBetweenLists={24}
      >
        <GameCollection onSelectGame={handleSelectGame} />
      </GameCollections>
    </CenterPane>
  )
}

export default Area
export { loader }
