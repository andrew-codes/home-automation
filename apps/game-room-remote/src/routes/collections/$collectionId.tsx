import AutoSizer from "react-virtualized-auto-sizer"
import { HeadersFunction, json, LoaderArgs } from "@remix-run/node"
import { useNavigate } from "@remix-run/react"
import styled from "styled-components"
import { FC, useCallback, useEffect, useReducer, useState } from "react"
import type { Swiper as SwiperImpl } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import { Helmet } from "react-helmet"
import collectionDefinitions from "../../api/collections.server"
import Layout from "../../components/Layout"
import GameCollectionSwiper, {
  GameChangeEventHandler,
  PageChangeEventEventHandler,
} from "../../components/GameCollectionSwiper"
import { GameCollection, GameCollectionDefinition } from "../../GameCollection"
import fetchGameCollections from "../../api/fetchGameCollection.server"
import { ceil, isEmpty, merge } from "lodash"
import useLoaderData from "../../useLoaderData"
import GameOverview from "../../components/GameOverview"
import { Game } from "../../Game"
import GameActions from "../../components/GameActions"

const gamesPerRow = 4
const rows = 3
const gamesPerPage = gamesPerRow * rows

const headers: HeadersFunction = () => {
  let cacheControlHeader = "public, s-maxage=60"
  if (process.env.NODE_ENV === "development") {
    cacheControlHeader = "no-cache"
  }

  return {
    "Cache-Control": cacheControlHeader,
  }
}

const loader = async (args: LoaderArgs) => {
  const activeCollectionIndex = collectionDefinitions.findIndex(
    ({ id }) => id === args.params.collectionId,
  )
  const pageIndex = parseInt(
    new URL(args.request.url).searchParams.get("pageIndex") ?? "0",
  )
  const currentGameId = new URL(args.request.url).searchParams.get(
    "currentGameId",
  )

  const viewableCollectionDefinitions: GameCollectionDefinition[] =
    collectionDefinitions
      .slice(0, Math.max(3, activeCollectionIndex + 1))
      .map((collection) =>
        merge({}, collection, {
          currentPageIndex: pageIndex,
          countPerPage: gamesPerPage,
        }),
      )

  const [collections, games] = await fetchGameCollections(
    viewableCollectionDefinitions,
  )
  const onlyCollectionsWithGames = collections.filter(
    ({ games }) => !isEmpty(games),
  )
  const currentCollection =
    onlyCollectionsWithGames.find(
      ({ id }) => args.params.collectionId === id,
    ) ?? onlyCollectionsWithGames[0]

  return json<{
    data: {
      cdnHost: string
      currentGame: Game
      currentCollection: GameCollection
      collections: GameCollection[]
      allMediaPreLoadLinks: string[]
    }
  }>({
    data: {
      allMediaPreLoadLinks: games
        .filter(({ coverImage }) => !!coverImage)
        .map(
          ({ id, coverImage }) =>
            `${process.env.GAMING_ASSETS_WEB_HOST}/resize/${coverImage}`,
        ),
      cdnHost: process.env.GAMING_ASSETS_WEB_HOST ?? "",
      collections: onlyCollectionsWithGames,
      currentCollection: currentCollection,
      currentGame:
        currentCollection.games
          .slice(
            currentCollection.currentPageIndex * currentCollection.countPerPage,
            (currentCollection.currentPageIndex + 1) *
              currentCollection.countPerPage *
              2,
          )
          .find(({ id }) => id === currentGameId) ??
        currentCollection.games[
          currentCollection.currentPageIndex * currentCollection.countPerPage
        ] ??
        currentCollection.games[0],
    },
  })
}

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
const GameCollections = styled.div`
  overflow: hidden;
  position: relative;
  flex-direction: column;
  z-index: 1;

  > div {
    padding: 0;
    display: flex;
    height: 100%;
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

const Overview = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1;
  max-width: 864px;

  > section {
    margin: 24px;
  }
`

type State = {
  collections: GameCollection[]
  currentCollection: GameCollection
  currentGame: Game
}
const selectGame = (id: string) => ({ type: "selectGame", payload: id })
const selectCollection = (id: string) => ({
  type: "selectCollection",
  payload: id,
})
const setPageIndex = (index: number) => ({
  type: "setPageIndex",
  payload: index,
})
type AnyAction =
  | ReturnType<typeof selectGame>
  | ReturnType<typeof selectCollection>
  | ReturnType<typeof setPageIndex>
const collectionReducer = (state: State, action: AnyAction): State => {
  switch (action.type) {
    case "selectGame":
      return merge(
        {},
        state,
        { currentGame: null },
        {
          currentGame:
            state.currentCollection.games.find(
              ({ id }) => id === action.payload,
            ) ??
            state.currentCollection.games.slice(
              state.currentCollection.currentPageIndex *
                state.currentCollection.countPerPage,
            )[0],
        },
      )

    case "selectCollection":
      const newCurrentCollection =
        state.collections.find(({ id }) => id === action.payload) ??
        state.collections[0]
      return merge(
        {},
        state,
        { currentCollection: null, currentGame: null },
        {
          currentCollection: newCurrentCollection,
          currentGame:
            newCurrentCollection.games.find(
              ({ id }) => id === state.currentGame.id,
            ) ??
            state.currentCollection.games.slice(
              state.currentCollection.currentPageIndex *
                state.currentCollection.countPerPage,
            )[0],
        },
      )

    case "setPageIndex":
      return {
        collections: state.collections.map((collection) =>
          merge({}, collection, { currentPageIndex: action.payload }),
        ),
        currentCollection: merge({}, state.currentCollection, {
          currentPageIndex: action.payload,
        }),
        currentGame:
          state.currentCollection.games.find(
            ({ id }) => id === state.currentGame.id,
          ) ??
          state.currentCollection.games[
            (action.payload as number) * state.currentCollection.countPerPage
          ],
      }
  }
  return state
}

const Collection: FC<{}> = () => {
  const {
    data: {
      allMediaPreLoadLinks,
      cdnHost,
      collections,
      currentGame,
      currentCollection,
    },
  } = useLoaderData<typeof loader>()

  const [state, dispatch] = useReducer(collectionReducer, {
    collections,
    currentCollection,
    currentGame,
  })

  const handleSelectGame = useCallback<GameChangeEventHandler>(
    (evt, { id }) => {
      dispatch(selectGame(id))
    },
    [],
  )
  const handleCollectionChange = useCallback(
    (swiper: SwiperImpl) => {
      dispatch(selectCollection(state.collections[swiper.activeIndex].id))
    },
    [state.collections],
  )
  const handlePageChange = useCallback<PageChangeEventEventHandler>(
    (evt, evtArgs) => {
      dispatch(setPageIndex(evtArgs.currentPageIndex))
    },
    [],
  )

  const navigate = useNavigate()
  useEffect(() => {
    navigate(
      `/collections/${state.currentCollection.id}?pageIndex=${state.currentCollection.currentPageIndex}&currentGameId=${state.currentGame.id}`,
    )
  }, [
    state.currentCollection.id,
    state.currentGame.id,
    state.currentCollection.currentPageIndex,
  ])

  const currentCollectionIndex = state.collections.findIndex(
    ({ id }) => id === state.currentCollection.id,
  )

  const previousCollectionIndex = Math.max(currentCollectionIndex - 1, 0)
  const nextCollectionIndex = Math.min(
    currentCollectionIndex + 1,
    state.collections.length - 1,
  )
  const spaceBetweenLists = 24
  const slidesPerView = 1
  const spaceBetween = 64

  const backgroundImageHeight = 1920
  const scaleFactor = 1.2

  const [systemState, setSystemState] = useState("")
  const startGame = useCallback(
    (evt) => {
      setSystemState(state.currentGame.id)
    },
    [state.currentGame.id],
  )
  const stopGame = useCallback((evt) => {
    setSystemState("")
  }, [])

  return (
    <Layout>
      <CenterPane>
        <Overview>
          <GameOverview
            {...state.currentGame}
            cdnHost={cdnHost}
            backgroundImageHeight={backgroundImageHeight}
          />
          <GameActions
            {...state.currentGame}
            systemState={systemState}
            onStart={startGame}
            onStop={stopGame}
          />
        </Overview>
        <GameCollections>
          <div>
            <AutoSizer disableWidth>
              {({ height }) => {
                const coverHeight = ceil(height / rows) - spaceBetweenLists - 24
                const coverWidth = ceil((coverHeight * 3) / 4)
                const width =
                  coverWidth * gamesPerRow + 48 + 24 * gamesPerRow + 48 + 48

                return (
                  <>
                    <Helmet>
                      {allMediaPreLoadLinks.map((imageBaseLink, index) => (
                        <link
                          rel="prefetch"
                          as="image"
                          type="image/webp"
                          key={`${imageBaseLink}-cover=${index}}`}
                          href={`${imageBaseLink}?width=${ceil(
                            coverWidth * scaleFactor,
                          )}&height=${ceil(coverHeight * scaleFactor)}`}
                        />
                      ))}
                      {allMediaPreLoadLinks.map((imageBaseLink, index) => (
                        <link
                          as="image"
                          type="image/webp"
                          rel="prefetch"
                          key={`${imageBaseLink}-background-${index}}`}
                          href={`${imageBaseLink}?height=${backgroundImageHeight}`}
                        />
                      ))}
                    </Helmet>
                    <Swiper
                      style={{
                        height: `${height}px`,
                        width: `${width}px`,
                      }}
                      initialSlide={currentCollectionIndex}
                      grabCursor
                      keyboard
                      mousewheel
                      onSlideChange={handleCollectionChange}
                      direction="horizontal"
                      slidesPerView={slidesPerView}
                      modules={[]}
                    >
                      {state.collections.map((collection, index) => {
                        return (
                          <>
                            <SwiperSlide
                              key={collection.id}
                              data-selected={index === currentCollectionIndex}
                              style={{}}
                            >
                              <GameCollectionSwiper
                                {...collection}
                                initialSelectedGameId={
                                  index === currentCollectionIndex
                                    ? state.currentGame.id
                                    : undefined
                                }
                                id={collection.id}
                                countPerPage={collection.countPerPage}
                                total={collection.total}
                                slidesPerView={1}
                                spaceBetween={spaceBetween}
                                cdnHost={cdnHost}
                                coverImageWidth={coverWidth}
                                width={width}
                                coverImageHeight={coverHeight}
                                onPageChange={handlePageChange}
                                onSelect={handleSelectGame}
                                scaleFactor={scaleFactor}
                              />
                            </SwiperSlide>
                          </>
                        )
                      })}
                    </Swiper>
                  </>
                )
              }}
            </AutoSizer>
          </div>
        </GameCollections>
      </CenterPane>
    </Layout>
  )
}

export default Collection
export { headers, loader }
