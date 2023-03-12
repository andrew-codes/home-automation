import { useCallback, useMemo, useReducer } from "react"
import { useQuery } from "@apollo/client"
import { json, LoaderArgs } from "@remix-run/node"
import styled, { createGlobalStyle } from "styled-components"
import { merge } from "lodash"
import { get } from "lodash/fp"
import { gql } from "../generated"
import useLoaderData from "../useLoaderData"
import GameOverview from "../components/GameOverview"
import GameActions from "../components/GameActions"
import collectionDefinitions from "../lib/gameCollections"
import MultiItemSwipeablePage from "../components/Swipeable/MultiItemSwipeablePage"
import PrefetchGameBackgrounds from "../components/PrefetchGameBackgrounds"
import SelecteableGame from "../components/SelectableGame"
import Text from "../components/Text"

const GameSelectionAnimationStyles = createGlobalStyle`
@keyframes selectGame {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.2);
  }
}
@keyframes deselectGame {
  from {
    transform: scale(1.20);
  }
  to {
    transform: scale(1);
  }
}
`

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
  width: 864px;

  > section {
    margin: 24px;
  }
`

const GameCollections = styled.div`
  overflow: hidden;
  position: relative;
  flex-direction: column;
  z-index: 1;
  flex: 1;

  // > div {
  //   padding: 0;
  //   display: flex;
  //   height: 100%;
  //   overflow: visible;
  //   position: relative;
  //   margin: 24px 0;

  //   .swiper-vertical {
  //     overflow: visible !important;
  //   }
  // }

  .swiper-horizontal {
    overflow: visible;
  }

  [data-selected="false"] [data-component="GameCover"] {
    box-shadow: none !important;
    border: 8px solid transparent !important;
  }
`
const GameCollection = styled.div`
  padding: 24px;
  margin: 24px;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  overflow: visible;
`
const GameCollectionName = styled.h2`
  position: absolute;
  background: var(--dark-gray);
  border-radius: 16px;
  z-index: 5;
  margin: 0 24px 24px;
  top: 0;
  left: 0;
  padding: 16px;
  width: calc(100% - ${({ margin }) => margin * 2}px);
`

const Games = styled.div`
  width: 100%;

  > div {
    margin: 12px;
  }
`

type Game = {
  id: string
  name: string
  coverImage: string
  backgroundImage: string
}
type GameCollecion = {
  id: string
  name: string
  items: Game[]
}
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

const changeCollection = (index: number) => ({
  type: "changeCollection",
  payload: index,
})
const changeGamePage = (index: number, gameIndex: number) => ({
  type: "changeGamePage",
  payload: { pageIndex: index, gameIndex },
})
const changeGame = (index: number) => ({
  type: "changeGame",
  payload: index,
})
type State = {
  currentCollectionIndex: number
  collectionIds: string[]
  collections: Record<string, { gamePageIndex: number; gameIndex: number }>
}
type AnyAction =
  | ReturnType<typeof changeCollection>
  | ReturnType<typeof changeGame>
  | ReturnType<typeof changeGamePage>
const reducer = (state: State, action: AnyAction): State => {
  switch (action.type) {
    case "changeCollection":
      return merge({}, state, {
        currentCollectionIndex: action.payload,
      })
    case "changeGamePage":
      return merge({}, state, {
        collections: {
          [state.collectionIds[state.currentCollectionIndex]]: {
            gamePageIndex: (action as ReturnType<typeof changeGamePage>).payload
              .pageIndex,
            gameIndex: (action as ReturnType<typeof changeGamePage>).payload
              .gameIndex,
          },
        },
      })
    case "changeGame":
      return merge({}, state, {
        collections: {
          [state.collectionIds[state.currentCollectionIndex]]: {
            gameIndex: action.payload,
          },
        },
      })
    default:
      return state
  }
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
      collectionDefinitions.map((collectionDefinition) => ({
        id: collectionDefinition.id,
        name: collectionDefinition.name,
        items: collectionDefinition.filter(games) as Game[],
      })),
    [games, collectionDefinitions],
  )
  const collectionIds = useMemo(
    () => collections.map(get("id")),
    [collections],
  ) as string[]

  const defaultCollectionIndex = 0
  const [state, dispatch] = useReducer(reducer, {
    currentCollectionIndex: defaultCollectionIndex,
    collectionIds: collectionIds,
    collections: {
      [collectionIds[defaultCollectionIndex]]: {
        gamePageIndex: 0,
        gameIndex: 0,
      },
    },
  })

  const selectedCollection = useMemo(
    () => collections[state.currentCollectionIndex],
    [collections, state.currentCollectionIndex],
  )
  const selectedGame = useMemo(() => {
    const collection = collections[state.currentCollectionIndex]
    return collection.items[state.collections[collection.id]?.gameIndex ?? 0]
  }, [collections, state.currentCollectionIndex, state.collections])

  const handleChangeCollection = useCallback((index) => {
    dispatch(changeCollection(index))
  }, [])
  const handleChangeGamesPage = useCallback((index, indexRange) => {
    dispatch(changeGamePage(index, indexRange[0]))
  }, [])
  const handleSelectGame = useCallback(
    (id) => {
      const gameIndex = collections[
        state.currentCollectionIndex
      ].items.findIndex((game) => game.id === id)
      console.log(selectedCollection)
      dispatch(changeGame(gameIndex))
    },
    [collections, state.currentCollectionIndex],
  )

  return (
    <>
      <GameSelectionAnimationStyles />
      <CenterPane>
        <PrefetchGameBackgrounds games={games} height={1920} />
        <Overview>
          <GameOverview {...selectedGame} height={1920} />
          <GameActions {...selectedGame} />
        </Overview>
        <GameCollections>
          <MultiItemSwipeablePage<GameCollecion>
            defaultPageIndex={defaultCollectionIndex}
            direction="horizontal"
            items={collections}
            onChangePage={handleChangeCollection}
            itemsPerRow={1}
            rows={1}
            spaceBetween={24}
          >
            {([collection], _, collectionDimensions) => {
              return (
                <GameCollection height={collectionDimensions.height}>
                  <Text as={GameCollectionName}>{collection.name}</Text>
                  <MultiItemSwipeablePage<Game>
                    direction="vertical"
                    items={collection.items}
                    itemsPerRow={4}
                    onChangePage={handleChangeGamesPage}
                    rows={3}
                    spaceBetween={24}
                  >
                    {(games, gamePageIndex, gameDimensions) => {
                      return (
                        <Games>
                          {games.map((game) => (
                            <SelecteableGame
                              {...game}
                              key={game.id}
                              height={gameDimensions.height}
                              width={gameDimensions.width}
                              onSelect={handleSelectGame}
                              active={game.id === selectedGame?.id}
                            />
                          ))}
                        </Games>
                      )
                    }}
                  </MultiItemSwipeablePage>
                </GameCollection>
              )
            }}
          </MultiItemSwipeablePage>
        </GameCollections>
      </CenterPane>
    </>
  )
}

export default Area
export { loader }
