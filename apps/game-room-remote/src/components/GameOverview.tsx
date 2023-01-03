import { first } from "lodash"
import { FC } from "react"
import styled from "styled-components"
import Text from "../components/Text"
import { Game } from "../Game"
import PrepareImage from "./PreloadImage"

const Overview = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
`
const Background = styled.div`
  flex: 1;
  background-image: url("${({ backgroundImage }) => backgroundImage}");
  background-size: cover;
`
const Details = styled.section`
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
      ellipse farthest-side at 70% 100%,
      var(--dark-slate-gray),
      rgba(255, 255, 255, 0)
    );
  padding: 120px 600px 48px 24px;
`
const GameName = styled.h3`
  font-size: 32px;
`
const GameDescription = styled.div`
  max-height: 160px;
  font-size: 24px;
  line-height: 1.32;
  overflow: hidden;
`

type GameOverviewProps = {
  cdnHost: string
} & Game

const GameOverview: FC<GameOverviewProps> = ({
  cdnHost,
  backgroundImage,
  name,
  platformReleases,
}) => {
  const background = !!backgroundImage
    ? `${cdnHost}/resize/${backgroundImage}?width=1400`
    : "none"
  return (
    <Overview>
      <Background backgroundImage={background} />
      <Details>
        <Text as={GameName}>{name}</Text>
        <Text
          as={GameDescription}
          dangerouslySetInnerHTML={{
            __html: first(platformReleases)?.description ?? "",
          }}
        ></Text>
      </Details>
    </Overview>
  )
}

export default GameOverview
