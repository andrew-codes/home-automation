import { first } from "lodash"
import { FC } from "react"
import styled from "styled-components"
import Text from "../components/Text"
import { Game } from "../Game"

const BodyBackground = styled.div`
  position: absolute;
  top: 0;
  height: 1920px;
  width: 2880px;
  left: 0;
  z-index: -1;
  overflow: hidden;
`

const Details = styled.section`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  padding: 24px;
  background: rgba(39, 40, 38, 1);
  height: 650px;
  margin-bottom: 24px;
  overflow: hidden;
`
const GameName = styled.h3`
  font-size: 32px;
`
const GameDescription = styled.div`
  font-size: 24px;
  line-height: 1.32;
  overflow: hidden;
`

type GameOverviewProps = {
  cdnHost: string
  backgroundImageHeight: number
} & Game

const GameOverview: FC<GameOverviewProps> = ({
  cdnHost,
  backgroundImage,
  backgroundImageHeight,
  name,
  releases,
}) => {
  const backgroundImageSrc = !!backgroundImage
    ? `${cdnHost}/resize/${backgroundImage}?height=${backgroundImageHeight}`
    : "none"

  return (
    <>
      <BodyBackground>
        <img src={backgroundImageSrc} alt={`${name} game background.`} />
      </BodyBackground>
      <Details>
        <Text as={GameName}>{name}</Text>
        <Text
          as={GameDescription}
          dangerouslySetInnerHTML={{
            __html: first(releases)?.description ?? "",
          }}
        ></Text>
      </Details>
    </>
  )
}

export default GameOverview
