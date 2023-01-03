import { Main } from "@atlaskit/page-layout"
import AutoSizer from "react-virtualized-auto-sizer"
import { json, LoaderArgs } from "@remix-run/node"
import { useNavigate } from "@remix-run/react"
import styled from "styled-components"
import { useCallback, useEffect, useReducer } from "react"
import type { Swiper as SwiperImpl } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import collectionDefinitions from "../../api/collections.server"
import Layout from "../../components/Layout"
import GameCollectionSwiper, {
  GameChangeEventHandler,
  PageChangeEventEventHandler,
} from "../../components/GameCollectionSwiper"
import { GameCollection, GameCollectionDefinition } from "../../GameCollection"
import fetchGameCollections from "../../api/fetchGameCollection.server"
import { isEmpty, merge } from "lodash"
import useLoaderData from "../../useLoaderData"
import PrepareImage from "../../components/PreloadImage"
import GameOverview from "../../components/GameOverview"
import { Game } from "../../Game"

export const loader = async (args: LoaderArgs) => {
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
        merge({}, collection, { currentPageIndex: pageIndex, countPerPage: 5 }),
      )

  const collections = await fetchGameCollections(viewableCollectionDefinitions)
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
    }
  }>({
    data: {
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
  flex-direction: column;
  margin-right: 0;
  height: 100vh;
  background-size: cover;
`
const GameCollections = styled.div`
  overflow: hidden;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: ${({ spaceBetween }) => spaceBetween}px;
    z-index: 2;
    background-color: var(--dark-slate-gray);
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0%,
      transparent 100%
    );
  }

  > div {
    padding: 48px 0 0 24px;
    display: flex;
    width: 100%;
    height: ${({ height }) => height}px;
    overflow: visible;
    position: relative;
    background: var(--dark-slate-gray);

    &:after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: ${({ spaceBetween }) => spaceBetween}px;
      z-index: 2;
      background-color: var(--dark-slate-gray);
      mask-image: linear-gradient(
        to top,
        rgba(0, 0, 0, 1) 0%,
        transparent 100%
      );
    }

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
const BottomSpacer = styled.div`
  height: 18px;
  background: var(--dark-slate-gray);
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

export default function Collection() {
  const {
    data: { cdnHost, collections, currentGame, currentCollection },
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
  const listHeight = 560
  const spaceBetweenLists = 24
  const listViewPortHeight = listHeight * 1.1 + 24 + 24
  const slidesPerView = 7
  const spaceBetween = 64
  const marginBottom = 48
  const slidesPerPage = 5

  return (
    <Layout>
      <Main>
        <CenterPane>
          <GameOverview {...state.currentGame} cdnHost={cdnHost} />

          <GameCollections
            height={listViewPortHeight}
            spaceBetween={spaceBetweenLists}
          >
            <div>
              <AutoSizer disableHeight>
                {({ width }) => (
                  <Swiper
                    style={{
                      height: `${listHeight}px`,
                      width: `${width - 48}px`,
                    }}
                    initialSlide={currentCollectionIndex}
                    grabCursor
                    keyboard
                    mousewheel
                    onSlideChange={handleCollectionChange}
                    direction="vertical"
                    spaceBetween={spaceBetweenLists}
                    slidesPerView={1}
                    modules={[]}
                  >
                    {state.collections.map((collection, index) => {
                      const coverImageWidth = Math.floor(
                        width / slidesPerView - spaceBetween,
                      )
                      const coverImageHeight =
                        listHeight - 24 - 24 - marginBottom

                      return (
                        <>
                          {collection.id === currentCollection.id &&
                            collection.games.map(
                              ({ id, backgroundImage, coverImage }) => (
                                <>
                                  <PrepareImage
                                    rel="preload"
                                    key={`${id}-${coverImage}`}
                                    src={`${cdnHost}/resize/${coverImage}?width=${coverImageWidth}&height=${coverImageHeight}`}
                                  />
                                  {state.currentGame.id === id && (
                                    <PrepareImage
                                      rel="preload"
                                      src={`${cdnHost}/resize/${backgroundImage}?width=1400`}
                                    />
                                  )}
                                  {index ===
                                    collection.currentPageIndex *
                                      slidesPerPage && (
                                    <PrepareImage
                                      rel="preload"
                                      src={`${cdnHost}/resize/${backgroundImage}?width=1400`}
                                    />
                                  )}
                                </>
                              ),
                            )}
                          {(collection.id !== currentCollection.id ||
                            (index === previousCollectionIndex &&
                              currentCollectionIndex !==
                                previousCollectionIndex) ||
                            (index === nextCollectionIndex &&
                              nextCollectionIndex !==
                                currentCollectionIndex)) &&
                            collection.games.map(
                              ({ id, backgroundImage, coverImage }, index) => (
                                <>
                                  {(index ===
                                    collection.currentPageIndex *
                                      slidesPerPage ||
                                    index ===
                                      collection.currentPageIndex *
                                        slidesPerPage) && (
                                    <PrepareImage
                                      rel="preload"
                                      key={`${id}-${backgroundImage}`}
                                      src={`${cdnHost}/resize/${backgroundImage}?width=1400`}
                                    />
                                  )}
                                  <PrepareImage
                                    rel="preload"
                                    key={`${id}-${coverImage}`}
                                    src={`${cdnHost}/resize/${coverImage}?width=${coverImageWidth}&height=${coverImageHeight}`}
                                  />
                                </>
                              ),
                            )}
                          <SwiperSlide
                            key={collection.id}
                            data-selected={index === currentCollectionIndex}
                          >
                            <div
                              style={{
                                padding: "16px 24px 0 24px",
                                borderRadius: index % 2 === 1 ? "20px" : "20px",
                                backgroundColor:
                                  index % 2 === 1
                                    ? "rgba(255,255,255,0.10)"
                                    : "rgba(13, 17, 23, 1)",
                              }}
                            >
                              <GameCollectionSwiper
                                {...collection}
                                initialSelectedGameId={
                                  index === currentCollectionIndex
                                    ? state.currentGame.id
                                    : undefined
                                }
                                slidesPerView={slidesPerView}
                                spaceBetween={spaceBetween}
                                cdnHost={cdnHost}
                                coverImageWidth={coverImageWidth}
                                height={listHeight}
                                coverImageHeight={coverImageHeight}
                                onPageChange={handlePageChange}
                                onSelect={handleSelectGame}
                              />
                            </div>
                          </SwiperSlide>
                        </>
                      )
                    })}
                  </Swiper>
                )}
              </AutoSizer>
            </div>
          </GameCollections>
          <BottomSpacer />
        </CenterPane>
      </Main>
    </Layout>
  )
}
