import { useCallback, useMemo, useReducer } from "react"
import { useQuery } from "@apollo/client"
import { json, LoaderArgs } from "@remix-run/node"
import { Helmet } from "react-helmet"
import styled, { createGlobalStyle } from "styled-components"
import { merge } from "lodash"
import { flow, get, take } from "lodash/fp"
import { gql } from "../generated"
import useLoaderData from "../useLoaderData"
import GameOverview from "../components/GameOverview"
import GameActions from "../components/GameActions"
import collectionDefinitions from "../lib/gameCollections"
import MultiItemSwipeablePage from "../components/Swipeable/MultiItemSwipeablePage"
import SelecteableGame from "../components/SelectableGame"
import Text from "../components/Text"
import concatPreparedMedia from "../components/PreparedMedia/concatPreparedMedia"
import { PreparedMedia } from "../components/PreparedMedia/types"
import { getMediaToPrepare } from "../lib/gameCollections/prepareMedia"

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

  > div {
    padding: 0;
    display: flex;
    height: 1920px;
    width: 1995px;
    overflow: visible;
    position: relative;
    margin: 24px 0;

    .swiper-vertical {
      overflow: visible !important;
    }
  }

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
  releases: {
    id: string
    platform: {
      name: string
    }
  }[]
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
  collections: Record<
    string,
    { gamePageIndex: number; gameIndex: number; numberOfGamesToLoad: number }
  >
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
      const collectionId = state.collectionIds[state.currentCollectionIndex]
      const collection = state.collections[collectionId]
      const oldPageIndex = collection.gamePageIndex
      const didPageForward =
        oldPageIndex <
        (action as ReturnType<typeof changeGamePage>).payload.pageIndex

      return merge({}, state, {
        collections: {
          [collectionId]: {
            gamePageIndex: (action as ReturnType<typeof changeGamePage>).payload
              .pageIndex,
            gameIndex: (action as ReturnType<typeof changeGamePage>).payload
              .gameIndex,
            numberOfGamesToLoad: didPageForward
              ? collection.numberOfGamesToLoad + countPerPage
              : collection.numberOfGamesToLoad,
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

const rows = 3
const itemsPerRow = 4
const countPerPage = rows * itemsPerRow
const pagesToPreload = 4

const Area = () => {
  const { areaId, cdnHost } = useLoaderData<typeof loader>()

  const { data } = useQuery(query, {
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

  const collectionIds = useMemo(
    () => collectionDefinitions.map(get("id")),
    [collectionDefinitions],
  ) as string[]
  const defaultCollectionIndex = 0
  const [state, dispatch] = useReducer(reducer, {
    currentCollectionIndex: defaultCollectionIndex,
    collectionIds: collectionIds,
    collections: collectionIds.reduce(
      (acc, id) =>
        merge({}, acc, {
          [id]: {
            gamePageIndex: 0,
            gameIndex: 0,
            numberOfGamesToLoad: countPerPage * pagesToPreload,
          },
        }),
      {},
    ),
  })
  const collections = useMemo(
    () =>
      collectionDefinitions.map((collectionDefinition) => {
        const collectionFilter = flow(
          collectionDefinition.filter,
          take(state.collections[collectionDefinition.id].numberOfGamesToLoad),
        )

        return {
          id: collectionDefinition.id,
          name: collectionDefinition.name,
          items: collectionFilter(games) as Game[],
        }
      }),
    [games, collectionDefinitions],
  )

  const selectedCollection = useMemo(
    () => collections[state.currentCollectionIndex],
    [collections, state.currentCollectionIndex],
  )
  const handleChangeCollection = useCallback((index) => {
    dispatch(changeCollection(index))
  }, [])

  const handleChangeGamesPage = useCallback((index, indexRange) => {
    dispatch(changeGamePage(index, indexRange[0]))
  }, [])

  const selectedGame = useMemo(
    () =>
      selectedCollection.items[
        state.collections[selectedCollection.id]?.gameIndex ?? 0
      ],
    [
      selectedCollection.items,
      selectedCollection.id,
      state.collections[selectedCollection.id]?.gameIndex,
    ],
  )
  const handleSelectGame = useCallback(
    (evt, id) => {
      const gameIndex = selectedCollection.items.findIndex(
        (game) => game.id === id,
      )
      dispatch(changeGame(gameIndex))
    },
    [selectedCollection.items],
  )

  let preparedMedia: PreparedMedia[] = []

  const height = 1920
  const width = 1995

  return (
    <>
      <GameSelectionAnimationStyles />
      <CenterPane>
        <Overview>
          <GameActions {...selectedGame} />
          <GameOverview {...selectedGame} height={height} />
        </Overview>
        <GameCollections>
          <div>
            <MultiItemSwipeablePage<GameCollecion>
              defaultPageIndex={defaultCollectionIndex}
              direction="horizontal"
              height={height}
              items={collections}
              onChangePage={handleChangeCollection}
              itemsPerRow={1}
              rows={1}
              spaceBetween={24}
              width={width}
            >
              {([collection], collectionIndex, collectionDimensions) => (
                <GameCollection height={collectionDimensions.height}>
                  <Text as={GameCollectionName}>{collection.name}</Text>
                  <MultiItemSwipeablePage<Game>
                    direction="vertical"
                    height={height - 96}
                    items={collection.items}
                    itemsPerRow={itemsPerRow}
                    onChangePage={handleChangeGamesPage}
                    rows={rows}
                    spaceBetween={24}
                    width={width - 96}
                  >
                    {(games, gamePageIndex, gameDimensions) => {
                      const target =
                        collectionIndex === state.currentCollectionIndex
                          ? "primary"
                          : collectionIndex ===
                              state.currentCollectionIndex - 1 ||
                            collectionIndex === state.currentCollectionIndex + 1
                          ? "secondary"
                          : false
                      const mediaToPrepare = getMediaToPrepare(
                        target,
                        state.collections[state.currentCollectionIndex]
                          ?.gameIndex ?? 0,
                        countPerPage,
                        gamePageIndex,
                        games as any[],
                        gameDimensions,
                        { height },
                      )
                      const [newMedia, allPreparedMedia] =
                        concatPreparedMedia(mediaToPrepare)(preparedMedia)
                      preparedMedia = allPreparedMedia

                      return (
                        <Games>
                          <Helmet>
                            {newMedia.map((media) => (
                              <link
                                rel={media.mode}
                                as="image"
                                type="image/webp"
                                key={`${media.url}`}
                                href={media.url}
                              />
                            ))}
                          </Helmet>
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
              )}
            </MultiItemSwipeablePage>
          </div>
        </GameCollections>
      </CenterPane>
    </>
  )
}

export default Area
export { loader }
