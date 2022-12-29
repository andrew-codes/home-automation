import { Main } from "@atlaskit/page-layout"
import gql from "graphql-tag"
import { print } from "graphql"
import AutoSizer from "react-virtualized-auto-sizer"
import { ActionArgs, json, LoaderArgs } from "@remix-run/node"
import { Outlet, useFetcher, useLoaderData } from "@remix-run/react"
import type { GraphQLError } from "graphql"
import { sendGraphQLRequest } from "remix-graphql/index.server"
import styled from "styled-components"
import { FC, useEffect, useState } from "react"
import { Virtual, Mousewheel, Keyboard, EffectCreative } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import collections, { GameListGame } from "../collections.server"
import Layout from "../components/Layout"
import Text from "../components/Text"
import PrepareImage from "../components/PreloadImage"

type GamesQueryData = {
  data?: {
    games: GameListGame[]
  }
  errors?: GraphQLError[]
}

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
      query GameOverviews {
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
    }).then((res) => res.json())) as GamesQueryData
    const allGames = data?.games ?? []
    const games = collection(allGames) ?? []
    return json({ games: games.slice(0, pageNumber * 14) })
  }

  return null
}

const CenterPane = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 24px;
`
const GameStrip = styled.div`
  display: flex;

  .swiper-slide:first-child,
  > div > h2 {
    // margin-left: 72px !important;
  }
`

const GameList: FC<{
  collectionName: string
  cdnHost: string
  width: number
}> = ({ cdnHost, collectionName, width }) => {
  const slidesPerView = 7
  const spaceBetween = 0
  const slideWidth = Math.floor(width / slidesPerView - spaceBetween)
  const slideHeight = Math.floor((slideWidth * 4) / 3)
  const slidesPerGroup = 5

  const [currentPage, setCurrentPage] = useState(1)
  const fetcher = useFetcher()
  useEffect(() => {
    fetcher.submit(
      { collectionName, currentPage: currentPage.toString() },
      {
        method: "post",
      },
    )
  }, [currentPage, collectionName])
  const games = fetcher.data?.games ?? []

  return (
    <>
      <fetcher.Form />
      {games.map(({ id, coverImage }) => (
        <PrepareImage
          key={id}
          rel="preload"
          src={`${cdnHost}/resize/${coverImage}?width=${slideWidth}&height=${slideHeight}`}
        />
      ))}
      <Text as="h2">{collectionName}</Text>
      <Swiper
        style={{ height: `${slideHeight}px`, width: `${width}px` }}
        grabCursor
        keyboard
        mousewheel
        onSlideChange={(swiper) => {
          if (swiper.activeIndex + 1 > currentPage * slidesPerGroup) {
            setCurrentPage(currentPage + 1)
          }
        }}
        spaceBetween={spaceBetween}
        slidesPerGroup={slidesPerGroup}
        slidesPerView={slidesPerView}
        creativeEffect={{
          prev: {
            translate: ["-20%", 0, -1],
          },
        }}
        modules={[Virtual, Mousewheel, Keyboard, EffectCreative]}
      >
        {games.map(({ name, id, coverImage }, index) => (
          <SwiperSlide key={id}>
            <img
              alt={name}
              src={`${cdnHost}/resize/${coverImage}?width=${slideWidth}&height=${slideHeight}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

export default function Games() {
  const {
    data: { cdnHost, collections },
  } = useLoaderData<typeof loader>()

  return (
    <Layout>
      <Main>
        <CenterPane>
          <Outlet />
          <Text as="h1">Browse</Text>
          <GameStrip>
            <AutoSizer disableHeight>
              {({ width }) => {
                return (
                  <>
                    {collections.map((collection) => (
                      <div key={collection.name}>
                        <GameList
                          collectionName={collection.name}
                          cdnHost={cdnHost}
                          width={width}
                        />
                      </div>
                    ))}
                  </>
                )
              }}
            </AutoSizer>
          </GameStrip>
        </CenterPane>
      </Main>
    </Layout>
  )
}
