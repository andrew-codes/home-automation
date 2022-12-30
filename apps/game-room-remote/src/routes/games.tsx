import { Main } from "@atlaskit/page-layout"
import AutoSizer from "react-virtualized-auto-sizer"
import { json, LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import { useCallback, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import collections, { GameListGame } from "../collections.server"
import Layout from "../components/Layout"
import Text from "../components/Text"
import GameCollection, {
  CollectionGameSelection,
} from "../components/GameCollection"
import { first } from "lodash"

export const loader = async (args: LoaderArgs) => {
  return json({
    data: {
      cdnHost: process.env.GAMING_ASSETS_WEB_HOST ?? "",
      collections: Object.entries(collections).map(([name]) => ({
        name: name,
      })),
    },
  })
}

const CenterPane = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 0;
  height: 100vh;
  background-image: url("${({ backgroundImage }) => backgroundImage}");
  background-size: cover;
`
const SelectedGame = styled.div`
  display: flex;
  flex: 3;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
`
const GameBackground = styled.div`
  flex: 1;
`
const GameDetails = styled.div`
  overflow: hidden;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 3;
  background: radial-gradient(
      ellipse farthest-side at 0% 90%,
      rgba(13, 17, 23, 1) 20%,
      rgba(13, 17, 23, 0.5),
      rgba(255, 255, 255, 0)
    ),
    radial-gradient(
      ellipse farthest-side at 40% 100%,
      var(--dark-slate-gray) 10%,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0)
    ),
    radial-gradient(
      ellipse farthest-side at 60% 95%,
      var(--dark-slate-gray),
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0)
    );
  padding: 120px 600px 48px 24px;
  max-width: 1200px;
`
const GameName = styled.h3`
  max-width: 1200px;
`
const GameDescription = styled.div`
  max-height: 160px;
  max-width: 1200px;
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
    border: none !important;
  }
`
const BottomSpacer = styled.div`
  height: 18px;
  background: var(--dark-slate-gray);
`

export default function Games() {
  const {
    data: { cdnHost, collections },
  } = useLoaderData<typeof loader>()

  const [activeCollection, setActiveCollection] = useState(collections[0].name)
  const [currentGame, setCurrentGame] = useState<GameListGame>()
  const handleSelect = useCallback(
    (evt, collectionGameSelection: CollectionGameSelection) => {
      setCurrentGame(collectionGameSelection.game)
      setActiveCollection(collectionGameSelection.collectionName)
    },
    [],
  )

  const listHeight = 480
  const spaceBetweenLists = 24
  const listViewPortHeight = listHeight * 1.1 + 24 + 24

  return (
    <Layout>
      <Main>
        <CenterPane
          backgroundImage={`${cdnHost}/resize/${currentGame?.backgroundImage}?width=1400`}
        >
          <Outlet />
          <SelectedGame>
            <GameBackground
              backgroundImage={`${cdnHost}/resize/${currentGame?.backgroundImage}?width=1400`}
            />
            <GameDetails>
              <Text as={GameName}>{currentGame?.name}</Text>
              <Text
                as={GameDescription}
                dangerouslySetInnerHTML={{
                  __html:
                    first(currentGame?.platformReleases)?.description ?? "",
                }}
              ></Text>
            </GameDetails>
          </SelectedGame>
          <GameCollections
            activeIndex={
              collections.findIndex(
                (collection) => collection.name === activeCollection,
              ) ?? 0
            }
            height={listViewPortHeight}
            spaceBetween={spaceBetweenLists}
          >
            <div>
              <AutoSizer>
                {({ width, height }) => (
                  <Swiper
                    style={{
                      height: `${listHeight}px`,
                      width: `${width - 48}px`,
                    }}
                    grabCursor
                    keyboard
                    mousewheel
                    direction="vertical"
                    spaceBetween={spaceBetweenLists}
                    slidesPerView={1}
                    modules={[]}
                  >
                    {collections.map((collection, index) => (
                      <SwiperSlide
                        key={collection.name}
                        data-selected={collection.name === activeCollection}
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
                          <GameCollection
                            defaultSelection={index === 0}
                            collectionName={collection.name}
                            cdnHost={cdnHost}
                            width={width}
                            height={listHeight}
                            onSelect={handleSelect}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
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
