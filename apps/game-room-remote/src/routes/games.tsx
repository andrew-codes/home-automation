import { Main } from "@atlaskit/page-layout"
import gql from "graphql-tag"
import { print } from "graphql"
import AutoSizer from "react-virtualized-auto-sizer"
import { LoaderFunction, json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import type { GraphQLError } from "graphql"
import { sendGraphQLRequest } from "remix-graphql/index.server"
import { first, isEmpty, merge } from "lodash"
import styled from "styled-components"
import { FC, useCallback, useMemo, useState } from "react"
import { Virtual, Mousewheel, Keyboard, EffectCreative } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import { flow, filter, map, identity } from "lodash/fp"
import Filters from "../components/Filters"
import Layout from "../components/Layout"
import Navigation, { Section } from "../components/Navigation"
import NavigationLink from "../components/NavigationLink"
import Text from "../components/Text"
import PrepareImage from "../components/PreloadImage"

type GamesQueryData = {
  data?: {
    games: {
      id: string
      name: string
      coverImage: string
      backgroundImage: string
      platformReleases: {
        lastActivity: string
        description: string
      }[]
    }[]
  }
  errors?: GraphQLError[]
}
type PlatformQueryData = {
  data?: {
    platforms: {
      id: string
      name: string
    }
  }
}

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

const platformsQuery = print(gql`
  query PlatformNames {
    platforms {
      id
      name
    }
  }
`)

export const loader = async (args) => {
  const gqlRequest = await Promise.all([
    sendGraphQLRequest({
      // Pass on the arguments that Remix passes to a loader function.
      args,
      // Provide the endpoint of the remote GraphQL API.
      endpoint: `${process.env.GRAPH_HOST}/graphql`,
      // Optionally add headers to the request.
      // Provide the GraphQL operation to send to the remote API.
      query: gamesQuery,
      // Optionally provide variables that should be used for executing the
      // operation. If this is not passed, `remix-graphql` will derive variables
      // from...
      // - ...the route params.
      // - ...the submitted `formData` (if it exists).
      // That means the following is the default and could also be ommited.
      // variables: args.params,
    }).then((res) => res.json()) as GamesQueryData,
    sendGraphQLRequest({
      // Pass on the arguments that Remix passes to a loader function.
      args,
      // Provide the endpoint of the remote GraphQL API.
      endpoint: `${process.env.GRAPH_HOST}/graphql`,
      // Optionally add headers to the request.
      // Provide the GraphQL operation to send to the remote API.
      query: platformsQuery,
      // Optionally provide variables that should be used for executing the
      // operation. If this is not passed, `remix-graphql` will derive variables
      // from...
      // - ...the route params.
      // - ...the submitted `formData` (if it exists).
      // That means the following is the default and could also be ommited.
      // variables: args.params,
    }).then((res) => res.json()) as PlatformQueryData,
  ])

  const allGames = gqlRequest[0].data?.games ?? []
  const lastMonth = new Date(new Date().setDate(-30))
  const collections = [
    {
      name: "recently played",
      filter: filter<typeof allGames[number]>((game) =>
        game.platformReleases
          .map((release) => new Date(Date.parse(release.lastActivity)))
          .some((lastActivity) => lastActivity >= lastMonth),
      ),
    },
    {
      name: "all",
      filter: (allGames) => allGames,
    },
  ]

  return json({
    data: {
      cdnHost: process.env.GAMING_ASSETS_WEB_HOST,
      games: allGames,
      platforms: gqlRequest[1].data?.platforms ?? [],
      collections: collections.map((collection) => ({
        name: collection.name,
        games: collection.filter(allGames),
      })),
    },
  })
}

const CenterPane = styled.div`
  height: 100vh;
  display: flex;
  width: 100%;
  flex-direction: column;
  margin: 0 24px;
`
const GameStrip = styled.div`
  display: flex;

  .swiper-slide:first-child,
  > div > h2 {
    margin-left: 72px !important;
  }
`

const GameList: FC<{
  cdnHost: string
  width: number
  games: { id: string; coverImage: string; name: string }[]
}> = ({ cdnHost, games, width }) => {
  const slidesPerView = 7
  const spaceBetween = 64
  const slideWidth = Math.floor(width / slidesPerView - spaceBetween)
  const slideHeight = Math.floor((slideWidth * 4) / 3)

  return (
    <>
      {games.slice(0, Math.ceil(slidesPerView)).map(({ id, coverImage }) => (
        <PrepareImage
          key={id}
          rel="preload"
          src={`${cdnHost}/resize/${coverImage}?width=${slideWidth}&height=${slideHeight}`}
        />
      ))}
      <Swiper
        style={{ height: `${slideHeight}px`, width: `${width}px` }}
        virtual
        loop
        grabCursor
        keyboard
        mousewheel
        spaceBetween={spaceBetween}
        slidesPerGroup={5}
        slidesPerView={slidesPerView}
        creativeEffect={{
          prev: {
            translate: ["-20%", 0, -1],
          },
        }}
        modules={[Virtual, Mousewheel, Keyboard, EffectCreative]}
      >
        {games.map(({ name, id, coverImage }, index) => (
          <SwiperSlide key={id} virtualIndex={index}>
            <img
              src={`${cdnHost}/resize/${coverImage}?width=${slideWidth}&height=${slideHeight}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

function Games() {
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
                        <Text as="h2">{collection.name}</Text>
                        <GameList
                          cdnHost={cdnHost}
                          width={width}
                          games={collection.games}
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

export default Games
