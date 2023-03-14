import styled from "styled-components"
import Text from "./Text"
import { gql } from "../generated"
import { useQuery, useSubscription } from "@apollo/client"
import { FC, useEffect } from "react"

const query = gql(/* GraphQL */ `
  query Navigation {
    areas {
      id
      activity {
        release {
          game {
            name
            coverImage
          }
        }
        isRunning
        isLaunching
      }
    }
  }
`)

const subscriptionQuery = gql(/*GraphQL */ `
  subscription NowPlaying {
    activityChanged {
      areaId
      releaseId
    }
  }
`)

const NowPlayingSummary = styled.div`
  min-height: 64px;
  padding: 18px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  display: flex;

  img {
    height: 64px;
    width: 64px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }
  > *:not(img) {
    padding-top: 12px;
    padding-left: 18px;
  }
`

type NowPlayingProps = {
  cdnHost: string
  areaId: string
}
const NowPlaying: FC<NowPlayingProps> = ({ areaId, cdnHost }) => {
  const areaActivity = useQuery(query)
  const activitySubscription = useSubscription(subscriptionQuery)

  useEffect(() => {
    if (activitySubscription?.data?.activityChanged?.areaId === areaId) {
      areaActivity.refetch()
    }
  }, [
    activitySubscription?.data?.activityChanged?.areaId,
    areaActivity.refetch,
  ])

  const area = areaActivity.data?.areas.find(({ id }) => id === areaId)

  return (
    <NowPlayingSummary>
      <img
        src={`${cdnHost}/${area?.activity?.release.game.coverImage}`}
        alt={`Cover are of active game`}
      />
      <Text as="span">{area?.activity?.release.game.name}</Text>
    </NowPlayingSummary>
  )
}

export default NowPlaying
